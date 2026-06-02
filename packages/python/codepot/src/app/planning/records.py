"""Language-neutral generation plan records."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PlannedItem:
    """One item selected for generation."""

    kind: str
    source: object


@dataclass(frozen=True)
class GenerationPlan:
    """Language-neutral generation plan."""

    items: tuple[PlannedItem, ...]
