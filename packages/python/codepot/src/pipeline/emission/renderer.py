"""Jinja template rendering helpers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

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


def _template_context(context: TemplateFileContext) -> dict[str, object]:
    """Build shallow Jinja context for one planned template file.

    Keep this intentionally shallow. Jinja can access dataclass attributes
    directly, so we should not recursively convert the full SpecContext for
    every rendered file.
    """

    return {
        "file": context,
        "template": context.template,
        "language": context.language,
        "spec": context.spec,
        "project": context.spec.metadata.project,
        "records": context.records,
        "imports": context.imports,
        "exports": context.exports,
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

    template_file = context.template_file or context.template.template
    if template_file is None:
        raise ValueError(f"Template entry has no template file: {context.template_id}")

    template = environment.get_template(template_file)
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
