from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class InferredSchemaKind(StrEnum):
    UNKNOWN = "unknown"
    ENUM = "enum"
    MODEL = "model"
    QUERY = "query"
    DTO = "dto"
    RESPONSE = "response"
    REQUEST_BODY = "request_body"
    PARAMETER = "parameter"
    PRIMITIVE = "primitive"


@dataclass(frozen=True)
class InferredResource:
    name: str
    key: str
    path: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class InferredDependency:
    source_ref: str
    target_ref: str


@dataclass(frozen=True)
class InferredMediaType:
    content_type: str
    schema_ref: str | None = None
    schema_refs: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class InferredParameter:
    name: str
    location: str
    required: bool
    ref: str | None = None
    schema_ref: str | None = None
    schema_refs: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class InferredRequestBody:
    ref: str | None = None
    required: bool = False
    content_types: tuple[str, ...] = field(default_factory=tuple)
    media_types: tuple[InferredMediaType, ...] = field(default_factory=tuple)
    schema_refs: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class InferredResponse:
    status_code: str
    ref: str | None = None
    description: str = ""
    content_types: tuple[str, ...] = field(default_factory=tuple)
    media_types: tuple[InferredMediaType, ...] = field(default_factory=tuple)
    schema_refs: tuple[str, ...] = field(default_factory=tuple)
    is_success: bool = False
    is_error: bool = False


@dataclass(frozen=True)
class InferredSchema:
    name: str
    ref: str
    kind: InferredSchemaKind
    resource: InferredResource | None = None
    x_codegen: dict[str, Any] = field(default_factory=dict)
    raw: dict[str, Any] = field(default_factory=dict)
    dependencies: tuple[str, ...] = field(default_factory=tuple)
    alias_of: str | None = None
    is_alias: bool = False


@dataclass(frozen=True)
class InferredOperation:
    operation_id: str
    method: str
    path: str
    resource: InferredResource | None = None
    parameters: tuple[InferredParameter, ...] = field(default_factory=tuple)
    request_body: InferredRequestBody | None = None
    responses: tuple[InferredResponse, ...] = field(default_factory=tuple)
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class InferenceGraph:
    title: str
    openapi_version: str
    api_version: str
    resources: tuple[InferredResource, ...]
    schemas: tuple[InferredSchema, ...]
    operations: tuple[InferredOperation, ...]
    dependencies: tuple[InferredDependency, ...]
