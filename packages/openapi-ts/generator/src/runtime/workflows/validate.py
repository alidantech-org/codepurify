from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from core.logging import debug, step, success


def run_validate(context: RuntimeContext, input_path: Path) -> None:
    debug(f"Validate input: {input_path}", context.options.debug)

    with step("Validating OpenAPI document"):
        # TODO: load OpenAPI
        # TODO: validate required keys and supported shapes
        pass

    success("Validate command pipeline is wired")
