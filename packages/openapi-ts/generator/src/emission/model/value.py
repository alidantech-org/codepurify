"""Open template value wrapper for language-specific variables."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class TemplateValue:
    """A prepared template value.

    The value can represent anything a language wants to expose: type names,
    imports, exports, serializers, debug labels, paths, docs, or metadata.
    """

    value: Any

    def __str__(self) -> str:
        if self.value is None:
            return ""
        return str(self.value)
