"""Temporary Python language pipeline."""

from __future__ import annotations

from spec.languages.contracts import LanguagePlan
from spec.planning.records import GenerationPlan


class PythonLanguagePipeline:
    """Build a placeholder Python language plan."""

    def build(self, plan: GenerationPlan) -> LanguagePlan:
        """Build a temporary Python language plan."""

        return LanguagePlan(language="python", items=plan.items)
