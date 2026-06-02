"""Entity field definition models for compiled Codepot IR."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import ConfigDict, Field

from codepot.ir.shared.base import DefinitionItem
from codepot.ir.shared.ref import Ref


class QueryOperator(StrEnum):
    """Supported field query operators."""

    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    BETWEEN = "between"
    EXISTS = "exists"


class FieldCapabilityConfig(DefinitionItem):
    """Field query/sort/select capability configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    filter: bool | None = None
    sort: bool | None = None
    select: bool | None = None
    operators: list[QueryOperator] | None = None


class FieldVisibilityLevel(StrEnum):
    """Supported field visibility levels."""

    PUBLIC = "public"
    INTERNAL = "internal"
    SECRET = "secret"
    AUTH = "auth"


class FieldVisibilityConfig(DefinitionItem):
    """Field read/write visibility configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    read: FieldVisibilityLevel | None = None
    write: FieldVisibilityLevel | None = None
    sensitive: bool | None = None


class FieldLifecycleConfig(DefinitionItem):
    """Field lifecycle configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    create: bool | None = None
    update: bool | None = None
    immutable: bool | None = None
    generated: bool | None = None
    read_only: bool | None = None


class FieldPersistenceMode(StrEnum):
    """Supported persistence modes for entity fields."""

    STORED = "stored"
    VIRTUAL = "virtual"
    COMPUTED = "computed"


class FieldPersistenceConfig(DefinitionItem):
    """Field persistence configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    mode: FieldPersistenceMode
    generated: bool | None = None
    immutable: bool | None = None


class ArrayDefinition(DefinitionItem):
    """Array field constraints."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    min_items: int | None = None
    max_items: int | None = None
    unique_items: bool | None = None


class EntityRelationKind(StrEnum):
    """Supported entity relation kinds."""

    BELONGS_TO = "belongs_to"
    HAS_ONE = "has_one"
    HAS_MANY = "has_many"
    MANY_TO_MANY = "many_to_many"


class EntityRelationThroughDefinition(DefinitionItem):
    """Join-through relation definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    entity: Ref[Any]
    from_: Ref[Any] = Field(alias="from")
    to: Ref[Any]


class EntityRelationDefinition(DefinitionItem):
    """Entity relation target configuration."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    relation: EntityRelationKind
    target: Ref[Any]
    inverse: Ref[Any] | None = None
    through: EntityRelationThroughDefinition | None = None


class EntityFieldOptionsDefinition(DefinitionItem):
    """Common options shared by property and relation fields."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    required: bool | None = None
    nullable: bool | None = None
    array: bool | ArrayDefinition | None = None
    default: Any | None = None

    capability: FieldCapabilityConfig | None = None
    visibility: FieldVisibilityConfig | None = None
    lifecycle: FieldLifecycleConfig | None = None
    persistence: FieldPersistenceConfig | None = None


class EntityPropertyFieldDefinition(EntityFieldOptionsDefinition):
    """Entity field backed by a reusable property ref."""

    model_config = ConfigDict(frozen=True, extra="forbid", populate_by_name=True)

    ref: str = Field(alias="$ref")


class EntityRelationFieldDefinition(EntityRelationDefinition, EntityFieldOptionsDefinition):
    """Entity field backed by a relation target."""

    model_config = ConfigDict(frozen=True, extra="forbid")


EntityFieldDefinition = EntityPropertyFieldDefinition | EntityRelationFieldDefinition
