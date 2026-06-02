"""Repository-owned ref resolution."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from spec.ir.shared.ref import Ref


@dataclass(frozen=True)
class RefResolver:
    """Resolve refs behind the repository boundary."""

    index: dict[str, object]

    def resolve(self, ref: Ref[Any]) -> object:
        """Resolve a typed ref."""

        if ref.ref not in self.index:
            raise KeyError(f"Unknown Codepot ref: {ref.ref}")
        return self.index[ref.ref]
