"""Jinja template renderer for emission."""

from __future__ import annotations

from collections.abc import Iterable
from enum import Enum
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from contracts.emission import TemplateContext


def create_environment(template_root: Path) -> Environment:
    """Create a strict Jinja environment."""
    environment = Environment(
        loader=FileSystemLoader(str(template_root)),
        undefined=StrictUndefined,
        autoescape=select_autoescape(default=False),
        keep_trailing_newline=True,
        trim_blocks=True,
        lstrip_blocks=True,
    )

    environment.filters["dash"] = dash
    environment.filters["yesno"] = yesno
    environment.filters["csv"] = csv
    environment.filters["value"] = value

    return environment


def render_template(
    template_root: Path,
    relative_path: Path,
    context: TemplateContext,
) -> str:
    """Render a template by relative path."""
    environment = create_environment(template_root)
    template = environment.get_template(relative_path.as_posix())
    return template.render(**context)


def value(item: Any, default: str = "-") -> str:
    """Render a safe display value."""
    if item is None:
        return default

    if isinstance(item, Enum):
        return str(item.value)

    if isinstance(item, Path):
        return item.as_posix()

    if isinstance(item, bool):
        return "true" if item else "false"

    text = str(item)
    return text if text else default


def dash(item: Any) -> str:
    """Render a dash for empty values."""
    return value(item, "-")


def yesno(item: Any) -> str:
    """Render a boolean as yes/no."""
    return "yes" if bool(item) else "no"


def csv(items: Any, default: str = "-") -> str:
    """Render an iterable as comma-separated text."""
    if items is None:
        return default

    if isinstance(items, str):
        return items or default

    if not isinstance(items, Iterable):
        return value(items, default)

    values = [value(item, "") for item in items]
    values = [item for item in values if item]

    if not values:
        return default

    return ", ".join(values)
