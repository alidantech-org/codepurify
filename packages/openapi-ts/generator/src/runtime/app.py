"""Public runtime application API."""

from __future__ import annotations

from pathlib import Path

from runtime.models import (
    EmitInput,
    EmitOutput,
    InferInput,
    InferOutput,
    InspectInput,
    InspectOutput,
    ValidateInput,
    ValidateOutput,
)
from runtime.workflows.emit import run_emit
from runtime.workflows.infer import run_infer
from runtime.workflows.inspect import run_inspect
from runtime.workflows.validate import run_validate


class GeneratorApp:
    """Public runtime API for the generator.

    Interfaces such as CLI, UI, tests, or HTTP handlers should call this class.
    Runtime methods return structured results and do not render terminal output.
    """

    def inspect(self, input_path: Path) -> InspectOutput:
        """Inspect an OpenAPI document."""
        return run_inspect(
            InspectInput(
                input_path=input_path,
            )
        )

    def infer(
        self,
        input_path: Path,
        output_path: Path | None = None,
    ) -> InferOutput:
        """Run OpenAPI inference."""
        return run_infer(
            InferInput(
                input_path=input_path,
                output_path=output_path,
            )
        )

    def emit(
        self,
        input_path: Path,
        language: str,
        output_path: Path,
        *,
        dry_run: bool = False,
        templates_path: Path | None = None,
    ) -> EmitOutput:
        """Emit generated output for a language."""
        return run_emit(
            EmitInput(
                input_path=input_path,
                language=language,
                output_path=output_path,
                dry_run=dry_run,
                templates_path=templates_path,
            )
        )

    def validate(self, input_path: Path) -> ValidateOutput:
        """Validate an OpenAPI document."""
        return run_validate(
            ValidateInput(
                input_path=input_path,
            )
        )
