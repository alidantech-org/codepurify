"""Emission engine for template rendering and file writing.

The engine consumes TemplateContract and produces rendered files. It does not
know about concrete language implementations, OpenAPI documents, or inference.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from contracts.emission import (
    EmissionFile,
    EmissionPlan,
    EmissionResult,
    EmissionWriteResult,
    TemplateContext,
)
from contracts.events import ProgressSink, RuntimeEvent
from contracts.template import TemplateContract
from emission.templates.descriptor import GROUP_GLOBAL, TemplateDescriptor
from emission.templates.path_expander import expand_template_path
from emission.templates.renderer import render_template
from emission.templates.scanner import scan_templates
from emission.writer.file_writer import write_text_if_changed


@dataclass(frozen=True)
class EmissionContextBuilder:
    """Builds template contexts from a TemplateContract."""

    contract: TemplateContract

    def global_context(self) -> TemplateContext:
        """Build context for global templates."""
        return self._build_context()

    def schema_context(self, schema: Any) -> TemplateContext:
        """Build context for a schema template."""
        return self._build_context(schema=schema)

    def resource_context(self, resource: Any) -> TemplateContext:
        """Build context for a resource template."""
        return self._build_context(resource=resource)

    def operation_context(self, operation: Any) -> TemplateContext:
        """Build context for an operation template."""
        return self._build_context(operation=operation)

    def dto_context(self, dto: Any) -> TemplateContext:
        """Build context for a DTO template."""
        return self._build_context(dto=dto)

    def enum_context(self, enum: Any) -> TemplateContext:
        """Build context for an enum template."""
        return self._build_context(enum=enum)

    def _build_context(
        self,
        *,
        schema: Any = None,
        resource: Any = None,
        operation: Any = None,
        dto: Any = None,
        enum: Any = None,
    ) -> TemplateContext:
        context: dict[str, Any] = {
            "project": self.contract.project,
            "api": self.contract.api,
            "lang": self.contract.lang,
            "emit": self.contract.emit,
            "meta": self.contract.meta,
        }

        if schema is not None:
            context["schema"] = schema
        if resource is not None:
            context["resource"] = resource
        if operation is not None:
            context["operation"] = operation
        if dto is not None:
            context["dto"] = dto
        if enum is not None:
            context["enum"] = enum

        return context


def emit(
    contract: TemplateContract,
    *,
    progress: ProgressSink | None = None,
) -> EmissionResult:
    """Plan and execute emission in one step."""
    plan = build_emission_plan(contract, progress=progress)
    return execute_emission(
        plan,
        dry_run=contract.emit.dry_run,
        progress=progress,
    )


def build_emission_plan(
    contract: TemplateContract,
    *,
    progress: ProgressSink | None = None,
) -> EmissionPlan:
    """Build an emission plan from a template contract without writing files."""
    if contract.emit.template_root is None:
        raise ValueError("template_root is required for emission")

    template_root = contract.emit.template_root
    output_root = contract.emit.output_path

    _notify(progress, "scanning_templates", f"Scanning templates in {template_root}")
    descriptors = scan_templates(template_root)

    context_builder = EmissionContextBuilder(contract)
    files: list[EmissionFile] = []

    for descriptor in descriptors:
        for context in _contexts_for_descriptor(descriptor, context_builder):
            output_path = _resolve_output_path(descriptor, context, output_root)
            content = _resolve_content(descriptor, template_root, context)

            files.append(
                EmissionFile(
                    template_path=descriptor.relative_path,
                    output_path=output_path,
                    context=context,
                    content=content,
                    group=descriptor.group,
                    is_template=_is_jinja_template(descriptor.relative_path),
                    compare_mode=_compare_mode_for_output(output_path),
                )
            )

    _notify(
        progress,
        "emission_plan_created",
        f"Planned {len(files)} files",
        total=len(files),
    )

    return EmissionPlan(
        language=contract.lang.name,
        template_root=template_root,
        output_root=output_root,
        files=tuple(files),
    )


def execute_emission(
    plan: EmissionPlan,
    *,
    dry_run: bool = False,
    progress: ProgressSink | None = None,
) -> EmissionResult:
    """Execute an emission plan by writing files unless dry-run is enabled."""
    if dry_run:
        _notify(
            progress,
            "emission_dry_run",
            f"Dry run skipped {len(plan.files)} files",
            total=len(plan.files),
        )
        return EmissionResult(
            plan=plan,
            write_result=EmissionWriteResult(
                skipped=tuple(file.output_path for file in plan.files),
            ),
        )

    created: list[Path] = []
    updated: list[Path] = []
    unchanged: list[Path] = []
    skipped: list[Path] = []

    for index, file in enumerate(plan.files, start=1):
        _notify(
            progress,
            "writing_file",
            f"Writing {file.output_path}",
            current=index,
            total=len(plan.files),
        )

        if file.is_template:
            if not isinstance(file.content, str):
                raise TypeError(f"Template content must be string: {file.template_path}")

            result = write_text_if_changed(
                file.output_path,
                file.content,
                compare_mode=file.compare_mode,
            )
            created.extend(result.created)
            updated.extend(result.updated)
            unchanged.extend(result.unchanged)
            skipped.extend(result.skipped)
            continue

        result = _write_raw_file(
            source_path=plan.template_root / file.template_path,
            output_path=file.output_path,
        )
        created.extend(result.created)
        updated.extend(result.updated)
        unchanged.extend(result.unchanged)
        skipped.extend(result.skipped)

    return EmissionResult(
        plan=plan,
        write_result=EmissionWriteResult(
            created=tuple(created),
            updated=tuple(updated),
            unchanged=tuple(unchanged),
            skipped=tuple(skipped),
        ),
    )


def _contexts_for_descriptor(
    descriptor: TemplateDescriptor,
    context_builder: EmissionContextBuilder,
) -> Iterable[TemplateContext]:
    """Yield all contexts needed by a descriptor group."""
    contract = context_builder.contract

    if descriptor.group == GROUP_GLOBAL:
        yield context_builder.global_context()
        return

    if descriptor.group == "schemas":
        for schema in contract.schemas:
            yield context_builder.schema_context(schema)
        return

    if descriptor.group == "resources":
        for resource in contract.resources:
            yield context_builder.resource_context(resource)
        return

    if descriptor.group == "operations":
        for operation in contract.operations:
            yield context_builder.operation_context(operation)
        return

    if descriptor.group == "dtos":
        for dto in contract.dtos:
            yield context_builder.dto_context(dto)
        return

    if descriptor.group == "enums":
        for enum in contract.enums:
            yield context_builder.enum_context(enum)
        return

    yield context_builder.global_context()


def _resolve_output_path(
    descriptor: TemplateDescriptor,
    context: TemplateContext,
    output_root: Path,
) -> Path:
    expanded = expand_template_path(descriptor.relative_path, context)
    return output_root / expanded


def _resolve_content(
    descriptor: TemplateDescriptor,
    template_root: Path,
    context: TemplateContext,
) -> str | bytes | None:
    if _is_jinja_template(descriptor.relative_path):
        return render_template(template_root, descriptor.relative_path, context)

    return None


def _write_raw_file(*, source_path: Path, output_path: Path) -> EmissionWriteResult:
    """Write a raw file with byte-level changed detection."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    new_content = source_path.read_bytes()

    if output_path.exists() and output_path.read_bytes() == new_content:
        return EmissionWriteResult(unchanged=(output_path,))

    if output_path.exists():
        output_path.write_bytes(new_content)
        return EmissionWriteResult(updated=(output_path,))

    output_path.write_bytes(new_content)
    return EmissionWriteResult(created=(output_path,))


def _is_jinja_template(path: Path) -> bool:
    return path.as_posix().endswith(".j2")


def _compare_mode_for_output(output_path: Path) -> str:
    suffix = output_path.suffix.lower()

    if suffix in {".dart", ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs"}:
        return "layout_insensitive"

    return "exact"


def _notify(
    progress: ProgressSink | None,
    stage: str,
    message: str,
    *,
    level: str = "info",
    current: int | None = None,
    total: int | None = None,
) -> None:
    if progress is None:
        return

    progress(
        RuntimeEvent(
            stage=stage,
            message=message,
            level=level,
            current=current,
            total=total,
        )
    )
