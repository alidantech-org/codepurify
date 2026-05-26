"""Template descriptor models.

Descriptors describe template files discovered under a template root. They are
generic and do not hardcode language-specific or domain-specific behavior.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

GROUP_GLOBAL = "global"

SINGULAR_TO_GROUP = {
    "resource": "resources",
    "schema": "schemas",
    "operation": "operations",
    "dto": "dtos",
    "enum": "enums",
    "field": "fields",
    "parameter": "parameters",
    "response": "responses",
    "request": "requests",
    "route": "routes",
    "barrel": "barrels",
    "file": "files",
}


@dataclass(frozen=True)
class TemplateDescriptor:
    """A discovered template file."""

    template_root: Path
    relative_path: Path
    group: str = GROUP_GLOBAL
    item_key: str | None = None
    is_template: bool = False


def describe_template(template_root: Path, relative_path: Path) -> TemplateDescriptor:
    """Build a generic descriptor from a relative template path."""
    item_key = _infer_item_key(relative_path)
    group = _group_for_item_key(item_key)

    return TemplateDescriptor(
        template_root=template_root,
        relative_path=relative_path,
        group=group,
        item_key=item_key,
        is_template=relative_path.as_posix().endswith(".j2"),
    )


def _infer_item_key(path: Path) -> str | None:
    """Infer item key from path tokens like [schema.name.path]."""
    for part in path.parts:
        key = _item_key_from_part(part)
        if key:
            return key

    return None


def _item_key_from_part(part: str) -> str | None:
    """Extract root variable name from a dynamic path segment."""
    if part.startswith("[...") and part.endswith("]"):
        expression = part[4:-1]
        return _root_name(expression)

    if part.startswith("[") and part.endswith("]"):
        expression = part[1:-1]
        return _root_name(expression)

    if "(" in part and ")" in part:
        start = part.find("(")
        end = part.find(")", start + 1)
        if end > start:
            expression = part[start + 1 : end]
            return _root_name(expression)

    return None


def _root_name(expression: str) -> str | None:
    root = expression.strip().split(".", 1)[0].strip()
    return root or None


def _group_for_item_key(item_key: str | None) -> str:
    if item_key is None:
        return GROUP_GLOBAL

    return SINGULAR_TO_GROUP.get(item_key, f"{item_key}s")
