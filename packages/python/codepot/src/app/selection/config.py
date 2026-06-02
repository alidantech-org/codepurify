"""Selection and path config models."""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, ConfigDict

from codepot.selection.kinds import SelectionKind


class BranchKind(StrEnum):
    """Allowed branching strategies."""

    FLAT = "flat"
    BY_OWNER = "by_owner"
    BY_RESOURCE = "by_resource"
    BY_IDENTITY = "by_identity"
    BY_FOLDER = "by_folder"
    ONCE = "once"


class SelectionGroup(BaseModel):
    """One config group that selects records for emission."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    select: SelectionKind
    branch: BranchKind = BranchKind.FLAT
    template: str
    output: str


class SelectionConfig(BaseModel):
    """Full selection/path config."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    version: int = 1
    groups: tuple[SelectionGroup, ...]
