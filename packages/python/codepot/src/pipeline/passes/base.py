"""Base pipeline pass contracts."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol

from pipeline.contracts.results import PassReport, PassStatus
from pipeline.contracts.state import PipelineState


@dataclass(frozen=True)
class PassResult:
    """Result returned by one pipeline pass."""

    state: PipelineState
    report: PassReport


class PipelinePass(Protocol):
    """Protocol implemented by every pipeline pass."""

    name: str
    title: str

    def run(self, state: PipelineState) -> PassResult: # type: ignore
        """Run this pass and return the updated state/report."""


def utc_now() -> datetime:
    """Return the current UTC timestamp."""

    return datetime.now(UTC)


def duration_ms(started_at: datetime, finished_at: datetime) -> int:
    """Return duration in milliseconds."""

    return int((finished_at - started_at).total_seconds() * 1000)


def make_report(
    *,
    name: str,
    title: str,
    status: PassStatus,
    message: str,
    started_at: datetime,
    finished_at: datetime,
) -> PassReport:
    """Create a simple pass report."""

    return PassReport(
        name=name,
        title=title,
        status=status,
        message=message,
        started_at=started_at,
        finished_at=finished_at,
        duration_ms=duration_ms(started_at, finished_at),
    )
