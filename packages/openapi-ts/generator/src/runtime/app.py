from __future__ import annotations

from pathlib import Path

from runtime.results import EmitResult, InferResult, InspectResult, ValidateResult
from runtime.workflows.emit import run_emit
from runtime.workflows.infer import run_infer
from runtime.workflows.inspect import run_inspect
from runtime.workflows.validate import run_validate


class GeneratorApp:
    """Public runtime API for the generator.

    Interfaces such as CLI, UI, tests, or HTTP handlers should call this class.
    Runtime methods return structured results and do not render terminal output.
    """

    def inspect(self, input_path: Path) -> InspectResult:
        """Inspect an OpenAPI document."""
        return run_inspect(input_path=input_path)

    def infer(
        self,
        input_path: Path,
        output_path: Path | None = None,
    ) -> InferResult:
        """Run OpenAPI inference."""
        return run_infer(
            input_path=input_path,
            output_path=output_path,
        )

    def emit(
        self,
        input_path: Path,
        language: str,
        output_path: Path,
        *,
        dry_run: bool = False,
        templates_path: Path | None = None,
    ) -> EmitResult:
        """Emit generated output for a language."""
        return run_emit(
            input_path=input_path,
            language=language,
            output_path=output_path,
            dry_run=dry_run,
            templates_path=templates_path,
        )

    def validate(self, input_path: Path) -> ValidateResult:
        """Validate an OpenAPI document."""
        return run_validate(input_path=input_path)
