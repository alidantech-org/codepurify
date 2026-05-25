from __future__ import annotations

from typing import Protocol

from emission.plan import EmissionPlan
from inference.models import InferenceGraph


class LanguageEmitter(Protocol):
    language: str

    def emit(self, graph: InferenceGraph) -> EmissionPlan:
        raise NotImplementedError
