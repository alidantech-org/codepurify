"""Universal open context object passed into templates."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class TemplateContext:
    """A recursive mapping for template variables.

    This is intentionally open-ended. Language planners own the variables they
    inject. Emission only resolves and renders them.
    """

    values: Mapping[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Return a plain dict for Jinja rendering."""
        return dict(self.values)

    def with_values(self, **values: Any) -> "TemplateContext":
        """Return a new context with additional top-level values."""
        merged = dict(self.values)
        merged.update(values)
        return TemplateContext(merged)

    def child(self, key: str, value: Any) -> "TemplateContext":
        """Return a new context with one nested value added."""
        merged = dict(self.values)
        merged[key] = value
        return TemplateContext(merged)

    def __getitem__(self, key: str) -> Any:
        return self.values[key]
