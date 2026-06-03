"""Pass 03: template package loading."""

from __future__ import annotations

from dataclasses import replace

from pipeline.contracts.diagnostics import PipelineDiagnostic, PipelineDiagnosticLevel
from pipeline.contracts.results import PassStatus, ReportCounter
from pipeline.contracts.state import PipelineState
from pipeline.passes.base import PassResult, make_report, utc_now
from pipeline.templates.loader import load_template_package


class TemplatePackagePass:
    """Load and parse template package config."""

    name = "p03_template_package"
    title = "Load template package"

    def run(self, state: PipelineState) -> PassResult:
        """Load template package config."""

        started_at = utc_now()
        diagnostics: list[PipelineDiagnostic] = []

        try:
            loaded = load_template_package(state.options.template_package_path)
        except (FileNotFoundError, ValueError) as error:
            diagnostics.append(
                PipelineDiagnostic(
                    level=PipelineDiagnosticLevel.ERROR,
                    pass_name=self.name,
                    code="template_package_load_failed",
                    message=str(error),
                )
            )

            finished_at = utc_now()
            report = make_report(
                name=self.name,
                title=self.title,
                status=PassStatus.FAILED,
                message="Template package loading failed.",
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
                diagnostics=tuple(diagnostics),
            )

            return PassResult(state=state, report=report)

        next_state = replace(state, template_package=loaded)

        finished_at = utc_now()
        report = make_report(
            name=self.name,
            title=self.title,
            status=PassStatus.SUCCESS,
            message="Template package loaded.",
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
                ReportCounter("templates", len(loaded.config.templates)),
                ReportCounter("format", 1, loaded.format.value),
            ),
        )

        return PassResult(state=next_state, report=report)
