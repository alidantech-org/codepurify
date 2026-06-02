"""Normalized spec context contracts used across the Codepot runtime.

These models are not the raw compiled IR models. They are generic, stable context
objects produced by the spec repository after loading, validating, normalizing,
and resolving the original spec/IR document.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any


class SpecRecordKind(StrEnum):
    """Normalized record kinds exposed by the spec repository."""

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
    OPERATION = "operation"
    ROUTE = "route"
    RESPONSE = "response"
    SECURITY = "security"
    URL = "url"


@dataclass(frozen=True)
class SpecRef:
    """Portable normalized reference exposed outside the spec repository."""

    value: str

    @property
    def key(self) -> str:
        """Return the last ref segment."""

        return self.value.rsplit("/", 1)[-1]


@dataclass(frozen=True)
class SpecRecordIdentity:
    """Parsed identity metadata from a normalized spec record key.

    Dot notation is identity metadata, not a filesystem path.

    Example:
        entity.user.nickname
        owner_identity = entity
        owner_key = user
        local_key = nickname
    """

    raw: str
    local_key: str
    owner_identity: str | None = None
    owner_key: str | None = None

    @property
    def has_owner(self) -> bool:
        """Return true when this record has parsed owner metadata."""

        return self.owner_identity is not None and self.owner_key is not None


@dataclass(frozen=True)
class SpecMetadata:
    """Human-facing metadata for a compiled spec and its source file."""

    file_path: Path
    file_size_bytes: int
    file_size_label: str
    line_count: int
    codepot_version: str
    project_key: str
    spec_version: int
    title: str
    api_version: str
    summary: str | None
    urls_count: int


@dataclass(frozen=True)
class SpecCounts:
    """Registry counts for a normalized Codepot spec repository."""

    content_types: int
    primitives: int
    enums: int
    composites: int
    entities: int
    field_sets: int
    models: int
    dtos: int
    params: int
    resources: int
    operations: int
    routes: int
    responses: int
    security: int
    urls: int

    @property
    def properties(self) -> int:
        """Return total reusable property records."""

        return self.primitives + self.enums + self.composites

    @property
    def schemas(self) -> int:
        """Return total reusable schema records."""

        return self.entities + self.field_sets + self.models + self.dtos + self.params

    @property
    def records(self) -> int:
        """Return total top-level normalized records."""

        return self.content_types + self.properties + self.schemas + self.resources + self.responses + self.security + self.urls


@dataclass(frozen=True)
class SpecRecord:
    """Generic normalized record exposed by the spec repository."""

    kind: SpecRecordKind
    key: str
    ref: SpecRef
    identity: SpecRecordIdentity
    title: str
    description: str | None = None
    owner: SpecRef | None = None
    data: Any | None = None


@dataclass(frozen=True)
class SpecResourceSummary:
    """Inspect-friendly resource summary."""

    key: str
    ref: SpecRef
    base_path: str
    folders: tuple[str, ...]
    routes: int
    operations: int


@dataclass(frozen=True)
class SpecSchemaSummary:
    """Inspect-friendly schema registry summary."""

    registry: str
    count: int


@dataclass(frozen=True)
class SpecContentTypeSummary:
    """Inspect-friendly content type summary."""

    key: str
    ref: SpecRef
    media_type: str
    strategy: str


@dataclass(frozen=True)
class SpecOverview:
    """Complete normalized overview of a compiled spec."""

    metadata: SpecMetadata
    counts: SpecCounts
    schemas: tuple[SpecSchemaSummary, ...]
    resources: tuple[SpecResourceSummary, ...]
    content_types: tuple[SpecContentTypeSummary, ...]