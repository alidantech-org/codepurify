"""Runtime emit workflow.

Orchestrates the full emission pipeline: OpenAPI loading, inference, contract
building, language adaptation, and template emission.
"""

from __future__ import annotations

from app.models import EmitInput, EmitOutput, RuntimeDiagnostic, RuntimeEvent
from emission.engine import emit as run_emission
from inference.contract import build_api_contract
from inference.engine import InferenceEngine
from languages.discovery import resolve_language_adapter
from openapi.loader import load_openapi_document


def run_emit(request: EmitInput) -> EmitOutput:
    """Run the emit workflow and return structured output."""
    _notify(
        request,
        stage="loading_openapi",
        message=f"Loading OpenAPI document from {request.input_path}",
    )

    document = load_openapi_document(request.input_path)

    _notify(
        request,
        stage="running_inference",
        message="Running OpenAPI inference",
    )

    inference_engine = InferenceEngine()
    graph = inference_engine.infer(document)

    _notify(
        request,
        stage="building_contract",
        message="Building API contract",
    )

    api_contract = build_api_contract(graph)

    _notify(
        request,
        stage="resolving_language",
        message=f"Resolving language adapter: {request.language}",
    )

    adapter = resolve_language_adapter(request.language)

    _notify(
        request,
        stage="building_template_contract",
        message="Building template contract",
    )

    template_root = request.templates_path if request.templates_path else None
    template_contract = adapter.build_template_contract(
        api=api_contract,
        output_path=request.output_path,
        template_root=template_root,
        dry_run=request.dry_run,
    )

    _notify(
        request,
        stage="emitting_files",
        message="Emitting files",
    )

    emission_result = run_emission(template_contract)

    _notify(
        request,
        stage="emission_complete",
        message="Emission completed",
        total=len(emission_result.plan.files),
    )

    diagnostics = [
        RuntimeDiagnostic(
            level="info",
            message=f"Emission completed: {len(emission_result.write_result.created)} created, "
            f"{len(emission_result.write_result.updated)} updated, "
            f"{len(emission_result.write_result.unchanged)} unchanged.",
        )
    ]

    if emission_result.write_result.skipped:
        diagnostics.append(
            RuntimeDiagnostic(
                level="info",
                message=f"{len(emission_result.write_result.skipped)} files skipped (dry run).",
            )
        )

    return EmitOutput(
        input_path=request.input_path,
        language=request.language,
        output_path=request.output_path,
        dry_run=request.dry_run,
        planned=[f.output_path for f in emission_result.plan.files],
        written=list(emission_result.write_result.created),
        updated=list(emission_result.write_result.updated),
        skipped=list(emission_result.write_result.skipped),
        diagnostics=diagnostics,
    )


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
