"""Jinja template rendering helpers."""

from __future__ import annotations

from dataclasses import asdict, dataclass, is_dataclass
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from pipeline.planning.contexts import PlannedTemplateContexts, TemplateFileContext


@dataclass(frozen=True)
class RenderedFile:
    """One rendered output file."""

    file_id: str
    output_path: Path
    relative_output_path: str
    content: str


@dataclass(frozen=True)
class RenderedFiles:
    """All rendered files."""

    files: tuple[RenderedFile, ...]


def _to_template_value(value: Any) -> Any:
    """Convert typed context values into Jinja-friendly data."""

    if is_dataclass(value) and not isinstance(value, type):
        return {key: _to_template_value(item) for key, item in asdict(value).items()}

    if isinstance(value, tuple | list):
        return [_to_template_value(item) for item in value]

    if isinstance(value, Path):
        return value.as_posix()

    if isinstance(value, dict):
        return {str(key): _to_template_value(item) for key, item in value.items()}

    return value


def _template_context(context: TemplateFileContext) -> dict[str, Any]:
    """Build Jinja context for one planned template file."""

    return {
        "file": _to_template_value(context),
        "template": _to_template_value(context.template),
        "language": _to_template_value(context.language),
        "spec": _to_template_value(context.spec),
        "records": _to_template_value(context.records),
        "imports": _to_template_value(context.imports),
        "exports": _to_template_value(context.exports),
    }


def create_environment(package_path: Path) -> Environment:
    """Create a strict Jinja environment for a template package."""

    return Environment(
        loader=FileSystemLoader(package_path),
        undefined=StrictUndefined,
        autoescape=False,
        keep_trailing_newline=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )


def render_template_file(
    *,
    environment: Environment,
    context: TemplateFileContext,
) -> RenderedFile:
    """Render one planned template file."""

    if context.template.template is None:
        raise ValueError(f"Template entry has no template file: {context.template_id}")

    template = environment.get_template(context.template.template)
    content = template.render(_template_context(context))

    return RenderedFile(
        file_id=context.file_id,
        output_path=context.output_path,
        relative_output_path=context.relative_output_path,
        content=content,
    )


def render_template_contexts(
    *,
    package_path: Path,
    contexts: PlannedTemplateContexts,
) -> RenderedFiles:
    """Render all planned template contexts."""

    environment = create_environment(package_path)

    return RenderedFiles(
        files=tuple(
            render_template_file(
                environment=environment,
                context=context,
            )
            for context in contexts.files
            if context.template.template is not None
        )
    )
