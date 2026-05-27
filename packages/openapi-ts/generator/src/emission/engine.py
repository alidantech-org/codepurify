"""Emission engine for template rendering and file writing.

The engine consumes TemplateContract and produces rendered files. It does not
know about concrete language implementations, OpenAPI documents, or inference.
"""

from __future__ import annotations

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
from emission.paths.config_loader import load_path_config
from emission.paths.selection import expand_selector_contexts
from emission.templates.descriptor import TemplateDescriptor
from emission.templates.path_expander import expand_template_path
from emission.templates.renderer import render_template
from emission.templates.scanner import scan_templates
from emission.writer.file_writer import write_text_if_changed

GROUP_GLOBAL = "global"


@dataclass(frozen=True)
class EmissionContextBuilder:
    """Builds base template contexts from a TemplateContract."""

    contract: TemplateContract

    def global_context(self) -> TemplateContext:
        """Build the global template context.

        Selectors from paths.yaml will enrich this context with selected aliases
        and exposed shortcut variables.
        """
        return {
            "project": self.contract.project,
            "api": self.contract.api,
            "lang": self.contract.lang,
            "emit": self.contract.emit,
            "meta": self.contract.meta,
            "resources": self.contract.resources,
            "schemas": self.contract.schemas,
            "operations": self.contract.operations,
            "file": self.contract.file,
        }


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

    _notify(progress, "loading_path_config", f"Loading path config from {template_root}")
    path_config = load_path_config(template_root)

    _notify(progress, "scanning_templates", f"Scanning templates in {template_root}")
    descriptors = scan_templates(template_root)

    base_context = EmissionContextBuilder(contract).global_context()
    files: list[EmissionFile] = []

    for descriptor in descriptors:
        for context in _contexts_for_descriptor(descriptor, base_context, path_config):
            output_path = _resolve_output_path(
                descriptor=descriptor,
                context=context,
                output_root=output_root,
                template_extension=path_config.template_extension,
            )
            content = _resolve_content(descriptor, template_root, context)

            files.append(
                EmissionFile(
                    template_path=descriptor.relative_path,
                    output_path=output_path,
                    context=context,
                    content=content,
                    group=_descriptor_group(descriptor),
                    is_template=_is_jinja_template(
                        descriptor.relative_path,
                        template_extension=path_config.template_extension,
                    ),
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
        else:
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
    base_context: TemplateContext,
    path_config: Any,
) -> tuple[TemplateContext, ...]:
    """Build render contexts for a descriptor using selector segments."""
    selector_names = tuple(token.expression for token in descriptor.selectors)

    if not selector_names:
        return (dict(base_context),)

    return expand_selector_contexts(
        base_context=base_context,
        selector_names=selector_names,
        path_config=path_config,
    )


def _resolve_output_path(
    *,
    descriptor: TemplateDescriptor,
    context: TemplateContext,
    output_root: Path,
    template_extension: str,
) -> Path:
    output_template = Path(*descriptor.output_parts)
    expanded = expand_template_path(
        output_template,
        context,
        template_extension=template_extension,
    )
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


def _descriptor_group(descriptor: TemplateDescriptor) -> str:
    """Return a display group for the descriptor."""
    if not descriptor.selectors:
        return GROUP_GLOBAL

    return descriptor.selectors[-1].expression


def _is_jinja_template(path: Path, template_extension: str = ".j2") -> bool:
    return path.as_posix().endswith(template_extension)


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
    """Emit a progress event."""
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
