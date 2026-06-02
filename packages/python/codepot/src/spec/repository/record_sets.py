"""Typed record set helpers."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Generic, TypeVar

RecordT = TypeVar("RecordT")


@dataclass(frozen=True)
class RecordSet(Generic[RecordT]):
    """Immutable collection with typed filtering."""

    records: tuple[RecordT, ...]

    def list(self) -> tuple[RecordT, ...]:
        """Return all records."""

        return self.records

    def where(self, predicate: Callable[[RecordT], bool]) -> RecordSet[RecordT]:
        """Return records matching a typed predicate."""

        return RecordSet(tuple(record for record in self.records if predicate(record)))

    def count(self) -> int:
        """Return record count."""

        return len(self.records)
