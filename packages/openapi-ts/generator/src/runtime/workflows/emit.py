from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from core.logging import debug, step, success
from emission.writer import FileWriter
from inference.engine import InferenceEngine
from openapi.loader import load_openapi_document
from runtime.presenters.emit_presenter import present_emission
from runtime.registry import create_language_emitter


def run_emit(context: RuntimeContext, input_path: Path, language: str, output_path: Path) -> None:
    debug(f"Emit input: {input_path}", context.options.debug)
    debug(f"Emit language: {language}", context.options.debug)
    debug(f"Emit output: {output_path}", context.options.debug)

    with step("Loading OpenAPI document"):
        document = load_openapi_document(input_path)

    with step("Running inference engine"):
        graph = InferenceEngine().infer(document)

    with step(f"Creating {language} emission plan"):
        emitter = create_language_emitter(language)
        plan = emitter.emit(graph)

    with step("Writing emitted files"):
        result = FileWriter().write_plan(
            plan=plan,
            output_root=output_path,
            dry_run=context.options.dry_run,
        )

    present_emission(plan, result, output_path)

    success("Emission completed")
