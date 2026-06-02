"""Language-neutral planning contracts.

These models define the stable planning context produced after the pipeline
selects normalized spec records but before language adaptation and file emission.

Planning answers:
- what should be generated
- why it was selected
- which spec records are involved
- which dependencies are known

Planning does not answer:
- how a language names/types/imports the item
- which exact template content is rendered
- how files are written
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from contracts.paths import PathGroupConfig, PathPlan, PlannedPath
from contracts.spec import (
    SpecComposite,
    SpecContentType,
    SpecDto,
    SpecEntity,
    SpecEnum,
    SpecErrorResponse,
    SpecFieldSet,
    SpecModel,
    SpecParams,
    SpecPrimitive,
    SpecRecord,
    SpecRef,
    SpecResource,
    SpecUrl,
)


class PlanningItemKind(StrEnum):
    """Kinds of planned generation items."""

    URL = "url"
    CONTENT_TYPE = "content_type"

    PRIMITIVE = "primitive"
    ENUM = "enum"
    COMPOSITE = "composite"

    ENTITY = "entity"
    FIELD_SET = "field_set"
    MODEL = "model"
    DTO = "dto"
    PARAMS = "params"

    RESOURCE = "resource"
    ERROR_RESPONSE = "error_response"

    ONCE = "once"


class PlanningReason(StrEnum):
    """Why an item was selected for generation."""

    SELECTED_BY_GROUP = "selected_by_group"
    SELECTED_BY_DEPENDENCY = "selected_by_dependency"
    SELECTED_BY_ONCE_GROUP = "selected_by_once_group"
    SELECTED_BY_SUPPORT_RULE = "selected_by_support_rule"


class PlanningDependencyKind(StrEnum):
    """Kinds of planning dependencies."""

    REF = "ref"
    OWNER = "owner"
    EXTENDS = "extends"
    FIELD = "field"
    ROUTE = "route"
    OPERATION = "operation"
    CONTENT_TYPE = "content_type"
    SECURITY = "security"


SpecPlannableItem = (
    SpecUrl
    | SpecContentType
    | SpecPrimitive
    | SpecEnum
    | SpecComposite
    | SpecEntity
    | SpecFieldSet
    | SpecModel
    | SpecDto
    | SpecParams
    | SpecResource
    | SpecErrorResponse
)


@dataclass(frozen=True)
class PlanningDependency:
    """One dependency discovered for a planned item."""

    kind: PlanningDependencyKind
    source: SpecRef
    target: SpecRef
    optional: bool = False


@dataclass(frozen=True)
class PlannedSpecItem:
    """One selected spec item before language adaptation."""

    kind: PlanningItemKind
    record: SpecRecord | None
    source: SpecPlannableItem | None
    group: PathGroupConfig
    path: PlannedPath
    reason: PlanningReason
    dependencies: tuple[PlanningDependency, ...]


@dataclass(frozen=True)
class PlannedOnceItem:
    """One once-per-run planned item."""

    group: PathGroupConfig
    path: PlannedPath
    reason: PlanningReason = PlanningReason.SELECTED_BY_ONCE_GROUP


@dataclass(frozen=True)
class PlanningSelection:
    """Items selected by one path/config group."""

    group: PathGroupConfig
    items: tuple[PlannedSpecItem, ...]
    once: PlannedOnceItem | None = None


@dataclass(frozen=True)
class GenerationPlan:
    """Complete language-neutral generation plan."""

    path_plan: PathPlan
    selections: tuple[PlanningSelection, ...]
    items: tuple[PlannedSpecItem, ...]
    once_items: tuple[PlannedOnceItem, ...]
    dependencies: tuple[PlanningDependency, ...]

    @property
    def total_items(self) -> int:
        """Return total planned item count."""

        return len(self.items) + len(self.once_items)
