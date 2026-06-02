"""Reference graph for Codepot IR records."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from codepot.ir.shared.ref import Ref


@dataclass
class RefGraph:
    """Directed graph of IR ref dependencies."""

    edges: dict[str, set[str]] = field(default_factory=dict)

    def dependencies_of(self, ref: Ref[Any]) -> tuple[Ref[Any], ...]:
        """Return direct dependencies for a ref."""

        return tuple(Ref[Any](ref=value) for value in sorted(self.edges.get(ref.ref, set())))

    def ordered_refs(self) -> tuple[str, ...]:
        """Return refs in stable placeholder order."""

        return tuple(sorted(self.edges))
