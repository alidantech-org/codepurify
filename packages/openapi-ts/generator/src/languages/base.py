from __future__ import annotations

from typing import Protocol

# TODO: Replace with new emission.templates.planning module
# from emission.plan import EmissionPlan
from inference.models import InferenceGraph


class EmissionPlan:
    """Temporary stub for old emission.plan.EmissionPlan"""

    pass


class LanguageEmitter(Protocol):
    language: str

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        raise NotImplementedError
