"""Emission engine for template rendering and file writing.

The engine consumes TemplateContract and produces rendered files. It does not
know about concrete language implementations, OpenAPI documents, or inference.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from contracts.emission import EmissionFile, EmissionPlan, EmissionResult, EmissionWriteResult, TemplateContext
from contracts.template import TemplateContract
from emission.templates.descriptor import TemplateDescriptor, TemplateOwner
from emission.templates.path_expander import expand_template_path
from emission.templates.renderer import render_template
from emission.templates.scanner import scan_templates
from emission.writer.file_writer import write_text_if_changed


@dataclass(frozen=True)
class EmissionContext:
    """Context builder for template rendering."""

    contract: TemplateContract

    def build_global_context(self) -> TemplateContext:
        """Build context for global templates."""
        return self._build_context()

    def build_schema_context(self, schema_index: int) -> TemplateContext:
        """Build context for a specific schema template."""
        return self._build_context(schema=self.contract.schemas[schema_index])

    def build_resource_context(self, resource_index: int) -> TemplateContext:
        """Build context for a specific resource template."""
        return self._build_context(resource=self.contract.resources[resource_index])

    def build_operation_context(self, operation_index: int) -> TemplateContext:
        """Build context for a specific operation template."""
        return self._build_context(operation=self.contract.operations[operation_index])

    def _build_context(
        self,
        schema: Any = None,
        resource: Any = None,
        operation: Any = None,
    ) -> TemplateContext:
        """Build template context from contract and optional owner."""
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

        return context


def build_emission_plan(contract: TemplateContract) -> EmissionPlan:
    """Build an emission plan from a template contract.

    Scans templates and plans all output files without writing them.
    """
    if contract.emit.template_root is None:
        raise ValueError("template_root is required for emission")

    template_root = contract.emit.template_root
    descriptors = scan_templates(template_root)
    context_builder = EmissionContext(contract)

    files: list[EmissionFile] = []

    for descriptor in descriptors:
        context = _build_context_for_descriptor(descriptor, context_builder)
        output_path = _resolve_output_path(descriptor, context, contract.emit.output_path)
        content = _resolve_content(descriptor, template_root, context)

        files.append(
            EmissionFile(
                template_path=descriptor.relative_path,
                output_path=output_path,
                context=context,
                content=content,
                group=descriptor.owner.value,
                is_template=descriptor.relative_path.as_posix().endswith(".j2"),
                compare_mode="exact",  # TODO: Language adapters should set this
            )
        )

    return EmissionPlan(
        language=contract.lang.name,
        template_root=template_root,
        output_root=contract.emit.output_path,
        files=tuple(files),
    )


def execute_emission(plan: EmissionPlan, dry_run: bool = False) -> EmissionResult:
    """Execute an emission plan, writing files to disk.

    Args:
        plan: The emission plan to execute.
        dry_run: If True, skip actual file writes.

    Returns:
        EmissionResult with write statistics.
    """
    if dry_run:
        return EmissionResult(
            plan=plan,
            write_result=EmissionWriteResult(
                created=tuple(),
                updated=tuple(),
                unchanged=tuple(),
                skipped=tuple(f.output_path for f in plan.files),
            ),
        )

    created: list[Path] = []
    updated: list[Path] = []
    unchanged: list[Path] = []

    for file in plan.files:
        if file.is_template:
            # Template files render to text
            if not isinstance(file.content, str):
                raise TypeError(f"Template content must be string: {file.template_path}")

            result = write_text_if_changed(file.output_path, file.content, compare_mode=file.compare_mode)
            created.extend(result.created)
            updated.extend(result.updated)
            unchanged.extend(result.unchanged)
        else:
            # Raw files copy bytes unchanged
            if file.content is None:
                # Read from source if not pre-loaded
                source_path = plan.template_root / file.template_path
                file_content = source_path.read_bytes()
            else:
                file_content = file.content if isinstance(file.content, bytes) else str(file.content).encode()

            _write_raw_file(file.output_path, file_content)
            created.append(file.output_path)

    return EmissionResult(
        plan=plan,
        write_result=EmissionWriteResult(
            created=tuple(created),
            updated=tuple(updated),
            unchanged=tuple(unchanged),
            skipped=tuple(),
        ),
    )


def emit(contract: TemplateContract) -> EmissionResult:
    """Convenience function to plan and execute emission in one step."""
    plan = build_emission_plan(contract)
    return execute_emission(plan, dry_run=contract.emit.dry_run)


def _build_context_for_descriptor(
    descriptor: TemplateDescriptor,
    context_builder: EmissionContext,
) -> TemplateContext:
    """Build appropriate context based on template owner."""
    if descriptor.owner == TemplateOwner.GLOBAL:
        return context_builder.build_global_context()

    if descriptor.owner == TemplateOwner.SCHEMA:
        # Use first schema for now - engine should iterate in real implementation
        if context_builder.contract.schemas:
            return context_builder.build_schema_context(0)
        return context_builder.build_global_context()

    if descriptor.owner == TemplateOwner.RESOURCE:
        if context_builder.contract.resources:
            return context_builder.build_resource_context(0)
        return context_builder.build_global_context()

    if descriptor.owner == TemplateOwner.OPERATION:
        if context_builder.contract.operations:
            return context_builder.build_operation_context(0)
        return context_builder.build_global_context()

    # Default to global context for other owners
    return context_builder.build_global_context()


def _resolve_output_path(
    descriptor: TemplateDescriptor,
    context: TemplateContext,
    output_root: Path,
) -> Path:
    """Resolve output path by expanding template path with context."""
    expanded = expand_template_path(descriptor.relative_path, context)
    return output_root / expanded


def _resolve_content(
    descriptor: TemplateDescriptor,
    template_root: Path,
    context: TemplateContext,
) -> str | bytes | None:
    """Resolve file content - render templates or defer raw file reading."""
    if descriptor.relative_path.as_posix().endswith(".j2"):
        return render_template(template_root, descriptor.relative_path, context)

    # Raw files - defer reading until write phase
    return None


def _write_raw_file(path: Path, content: bytes) -> None:
    """Write raw file bytes, creating parent directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
