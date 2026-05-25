from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from runtime.workflows.emit import run_emit
from runtime.workflows.infer import run_infer
from runtime.workflows.inspect import run_inspect
from runtime.workflows.validate import run_validate


class GeneratorApp:
    def __init__(self, context: RuntimeContext) -> None:
        self.context = context

    def inspect(self, input_path: Path) -> None:
        run_inspect(self.context, input_path)

    def infer(self, input_path: Path, output_path: Path | None = None) -> None:
        run_infer(self.context, input_path, output_path)

    def emit(self, input_path: Path, language: str, output_path: Path) -> None:
        run_emit(self.context, input_path, language, output_path)

    def validate(self, input_path: Path) -> None:
        run_validate(self.context, input_path)
