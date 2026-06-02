"""Resolve predetermined selections into repository record sets."""

from __future__ import annotations

from codepot.repository.document import CodepotRepository
from codepot.repository.record_sets import RecordSet
from codepot.selection.kinds import SelectionKind


def resolve_selection(repo: CodepotRepository, kind: SelectionKind) -> RecordSet[object]:
    """Resolve a config selection kind to typed records."""

    if kind == SelectionKind.CONTENT_TYPES:
        return repo.content_types
    if kind == SelectionKind.PRIMITIVES:
        return repo.primitives
    if kind == SelectionKind.ENUMS:
        return repo.enums
    if kind == SelectionKind.COMPOSITES:
        return repo.composites
    if kind == SelectionKind.ENTITIES:
        return repo.entities
    if kind == SelectionKind.MODELS:
        return repo.models
    if kind == SelectionKind.DTOS:
        return repo.dtos
    if kind == SelectionKind.PARAMS:
        return repo.params
    if kind == SelectionKind.RESOURCES:
        return repo.resources
    if kind == SelectionKind.ERRORS:
        return repo.errors
    return RecordSet(tuple())
