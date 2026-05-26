"""Jinja template renderer for emission."""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from contracts.emission import TemplateContext


def create_environment(template_root: Path) -> Environment:
    """Create a strict Jinja environment."""
    return Environment(
        loader=FileSystemLoader(str(template_root)),
        undefined=StrictUndefined,
        autoescape=select_autoescape(default=False),
        keep_trailing_newline=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )


def render_template(
    template_root: Path,
    relative_path: Path,
    context: TemplateContext,
) -> str:
    """Render a template by relative path."""
    environment = create_environment(template_root)
    template = environment.get_template(relative_path.as_posix())
    return template.render(**context)
