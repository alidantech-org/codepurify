from __future__ import annotations

from typing import Protocol

from emission.planning.render_context import RenderContexts
from inference.models import InferenceGraph

# TODO: Replace with new emission.templates.planning module
# from emission.plan import EmissionPlan


class EmissionPlan:
    """Temporary stub for old emission.plan.EmissionPlan"""

    pass


class LanguageEmitter(Protocol):
    language: str

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        raise NotImplementedError


class LanguagePlanner(Protocol):
    """Language planner for building render contexts from inference graphs."""

    language: str

    def build_render_contexts(
        self,
        *,
        graph: InferenceGraph | None,
    ) -> RenderContexts:
        """Build render contexts for template emission."""
        raise NotImplementedError
