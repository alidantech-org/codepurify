"""Language-neutral planning pipeline."""

from __future__ import annotations

from codepot.planning.records import GenerationPlan, PlannedItem
from codepot.repository.document import CodepotRepository


def build_fake_generation_plan(repo: CodepotRepository) -> GenerationPlan:
    """Build a temporary fake plan to verify CLI flow."""

    items = [
        PlannedItem(kind="enums", source=repo.enums.count()),
        PlannedItem(kind="models", source=repo.models.count()),
        PlannedItem(kind="dtos", source=repo.dtos.count()),
        PlannedItem(kind="resources", source=repo.resources.count()),
    ]
    return GenerationPlan(items=tuple(items))
