"""Variable resolver for template path expressions."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any


class VariableResolutionError(KeyError):
    """Raised when a template path variable cannot be resolved."""


def resolve_variable(context: Mapping[str, Any], expression: str) -> Any:
    """Resolve dotted expressions like schema.name.path.s from context."""
    current: Any = context

    for part in expression.split("."):
        if not part:
            raise VariableResolutionError(expression)

        current = _resolve_part(current, part, expression)

    return current


def stringify_value(value: Any) -> str:
    """Convert resolved values into safe path/render strings."""
    if value is None:
        return ""

    return str(value)


def _resolve_part(current: Any, part: str, expression: str) -> Any:
    if isinstance(current, Mapping):
        if part not in current:
            raise VariableResolutionError(expression)
        return current[part]

    if hasattr(current, part):
        return getattr(current, part)

    raise VariableResolutionError(expression)
