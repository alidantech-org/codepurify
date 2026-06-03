"""Pass 02: spec repository loading."""

from __future__ import annotations

from dataclasses import replace

from pipeline.contracts.results import PassStatus, ReportCounter
from pipeline.contracts.state import PipelineState
from pipeline.passes.base import PassResult, make_report, utc_now
from spec.repository import SpecRepository


class SpecRepositoryPass:
    """Load the compiled spec into the typed repository."""

    name = "p02_spec_repository"
    title = "Load spec repository"

    def run(self, state: PipelineState) -> PassResult:
        """Load spec repository and context."""

        started_at = utc_now()

        repository = SpecRepository.from_file(state.options.spec_path)
        context = repository.get_context()
        counts = repository.get_counts()

        next_state = replace(
            state,
            spec_repository=repository,
            spec_context=context,
        )

        finished_at = utc_now()
        report = make_report(
            name=self.name,
            title=self.title,
            status=PassStatus.SUCCESS,
            message="Spec repository loaded.",
            started_at=started_at,
            finished_at=finished_at,
        )

        report = report.__class__(
            name=report.name,
            title=report.title,
            status=report.status,
            message=report.message,
            started_at=report.started_at,
            finished_at=report.finished_at,
            duration_ms=report.duration_ms,
            counters=(
                ReportCounter("records", counts.records_total),
                ReportCounter("resources", counts.resources),
                ReportCounter("models", counts.models),
                ReportCounter("dtos", counts.dtos),
                ReportCounter("routes", counts.routes),
            ),
        )

        return PassResult(state=next_state, report=report)
