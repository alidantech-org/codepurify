"""Runtime emit workflow.

Temporary implementation while the real template emission pipeline is being
rewired. It returns structured output only; adapters decide presentation.
"""

from __future__ import annotations

from pathlib import Path

from app.models import EmitInput, EmitOutput, RuntimeDiagnostic, RuntimeEvent


def run_emit(request: EmitInput) -> EmitOutput:
    """Run the emit workflow and return structured output."""
    _notify(
        request,
        stage="planning_emission",
        message=f"Planning {request.language} emission",
    )

    planned = _fake_planned_paths(request.output_path)

    if request.dry_run:
        _notify(
            request,
            stage="dry_run_complete",
            message="Dry run completed",
            total=len(planned),
        )
        return EmitOutput(
            input_path=request.input_path,
            language=request.language,
            output_path=request.output_path,
            dry_run=True,
            planned=planned,
            diagnostics=[
                RuntimeDiagnostic(
                    level="info",
                    message="Dry run completed; no files were written.",
                )
            ],
        )

    _notify(
        request,
        stage="emission_complete",
        message="Temporary emit workflow completed",
        total=len(planned),
    )

    return EmitOutput(
        input_path=request.input_path,
        language=request.language,
        output_path=request.output_path,
        dry_run=False,
        planned=planned,
        written=planned,
        updated=[],
        skipped=[],
        diagnostics=[
            RuntimeDiagnostic(
                level="warning",
                message="Using temporary emit workflow; real emission is not wired yet.",
            )
        ],
    )


def _fake_planned_paths(output_path: Path) -> list[Path]:
    """Return temporary planned output paths for CLI/runtime integration tests."""
    return [
        output_path / "summary.txt",
        output_path / "schemas" / "user" / "schema.txt",
        output_path / "operations" / "create_user" / "operation.txt",
    ]


def _notify(
    request: EmitInput,
    *,
    stage: str,
    message: str,
    level: str = "info",
    current: int | None = None,
    total: int | None = None,
) -> None:
    """Emit a runtime progress event when a sink is provided."""
    if request.progress is None:
        return

    request.progress(
        RuntimeEvent(
            stage=stage,
            message=message,
            level=level,
            current=current,
            total=total,
        )
    )
