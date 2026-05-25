from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from core.logging import debug, step, success
from inference.engine import InferenceEngine
from openapi.loader import load_openapi_document
from runtime.io.inference_output import write_inference_graph
from runtime.presenters.infer_presenter import present_inference


def run_infer(context: RuntimeContext, input_path: Path, output_path: Path | None = None) -> None:
    debug(f"Infer input: {input_path}", context.options.debug)
    debug(f"Infer output: {output_path}", context.options.debug)

    with step("Loading OpenAPI document"):
        document = load_openapi_document(input_path)

    with step("Running inference engine"):
        graph = InferenceEngine().infer(document)

    present_inference(graph)

    if output_path is not None:
        write_inference_graph(graph, output_path)

    success("Inference completed")
