"""Import planner contracts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from contracts.template import TemplateDependency, TemplateFile, TemplateImport


@dataclass(frozen=True)
class ImportPlanningContext:
    """Facts needed by a language-specific import planner."""

    current_file: TemplateFile
    dependencies: tuple[TemplateDependency, ...]
    strategy: str
    output_root: Path | None = None


class ImportPlanner(Protocol):
    """Language-specific import/link planner."""

    def plan_imports(self, context: ImportPlanningContext) -> tuple[TemplateImport, ...]:
        """Build template-ready import objects."""
