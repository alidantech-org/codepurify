"""Pass 07: output file planning."""

from __future__ import annotations

from dataclasses import replace

from pipeline.contracts.diagnostics import PipelineDiagnostic, PipelineDiagnosticLevel
from pipeline.contracts.results import ReportCounter
from pipeline.contracts.state import PipelineState
from pipeline.passes.base import (
    PassResult,
    failed_result,
    success_result,
    utc_now,
)
from pipeline.planning.outputs import plan_output_files


class OutputPlanningPass:
    """Plan output files from template selections."""

    name = "p07_output_plan"
    title = "Plan output files"

    def run(self, state: PipelineState) -> PassResult:
        """Plan output files."""

        started_at = utc_now()

        if state.language_runtime is None:
            return failed_result(
                state=state,
                name=self.name,
                title=self.title,
                message="Output file planning failed.",
                started_at=started_at,
                diagnostic=PipelineDiagnostic(
                    level=PipelineDiagnosticLevel.ERROR,
                    pass_name=self.name,
                    code="language_runtime_missing",
                    message="Language runtime must be resolved before output planning.",
                ),
            )

        if state.spec_context is None:
            return failed_result(
                state=state,
                name=self.name,
                title=self.title,
                message="Output file planning failed.",
                started_at=started_at,
                diagnostic=PipelineDiagnostic(
                    level=PipelineDiagnosticLevel.ERROR,
                    pass_name=self.name,
                    code="spec_context_missing",
                    message="Spec context must be loaded before output planning.",
                ),
            )

        if state.template_package is None:
            return failed_result(
                state=state,
                name=self.name,
                title=self.title,
                message="Output file planning failed.",
                started_at=started_at,
                diagnostic=PipelineDiagnostic(
                    level=PipelineDiagnosticLevel.ERROR,
                    pass_name=self.name,
                    code="template_package_missing",
                    message="Template package must be loaded before output planning.",
                ),
            )

        try:
            files = plan_output_files(
                selections=state.selections,
                output_root=state.options.output_path,
                runtime=state.language_runtime,
                spec_context=state.spec_context,
                template_package=state.template_package,
            )
        except ValueError as error:
            return failed_result(
                state=state,
                name=self.name,
                title=self.title,
                message="Output file planning failed.",
                started_at=started_at,
                diagnostic=PipelineDiagnostic(
                    level=PipelineDiagnosticLevel.ERROR,
                    pass_name=self.name,
                    code="output_path_expansion_failed",
                    message=str(error),
                ),
            )

        return success_result(
            state=replace(state, output_files=files),
            name=self.name,
            title=self.title,
            message="Output files planned.",
            started_at=started_at,
            counters=(ReportCounter("files", len(files)),),
        )
