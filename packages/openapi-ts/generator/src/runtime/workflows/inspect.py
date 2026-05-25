from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from core.logging import debug, step, success
from openapi.inspector import inspect_openapi_document
from openapi.loader import load_openapi_document
from runtime.presenters.inspect_presenter import present_inspection


def run_inspect(context: RuntimeContext, input_path: Path) -> None:
    debug(f"Inspect input: {input_path}", context.options.debug)

    with step("Loading OpenAPI document"):
        document = load_openapi_document(input_path)

    with step("Inspecting document"):
        inspection = inspect_openapi_document(document)

    present_inspection(inspection)

    success("OpenAPI inspection completed")
