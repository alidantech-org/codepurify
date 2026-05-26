from __future__ import annotations

from pathlib import Path

from core.config import RuntimeContext
from runtime.workflows.emit import run_emit
from runtime.workflows.emit_plan import run_emit_plan
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

    def emit_plan(
        self,
        *,
        input_path: Path | None = None,
        language: str,
        templates_path: Path | None = None,
    ) -> str:
        return run_emit_plan(
            self.context,
            input_path=input_path,
            language=language,
            templates_path=templates_path,
        )

    def validate(self, input_path: Path) -> None:
        run_validate(self.context, input_path)
