"""Language-neutral API contract.

This module defines the stable inferred API facts that language adapters consume.
It must not contain Dart, TypeScript, template, emission, or CLI behavior.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from contracts.names import ContractName


@dataclass(frozen=True)
class ApiDocumentInfo:
    """Top-level API document information."""

    title: str = "-"
    openapi_version: str = "-"
    api_version: str = "-"
    description: str = "-"


@dataclass(frozen=True)
class ApiQueryOptions:
    """Query behavior exposed by x-codegen metadata."""

    filter: bool = False
    operators: tuple[str, ...] = ()
    sort: bool = False
    select: bool = False
    search: bool = False
    exact: bool = False
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiResource:
    """Inferred resource group."""

    id: str
    name: ContractName
    path: str = "-"
    operations_count: int = 0
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiField:
    """Language-neutral schema field fact."""

    id: str
    name: ContractName
    required: bool = True
    nullable: bool = False
    api_type: str = "unknown"
    ref: str | None = None
    enum_ref: str | None = None
    description: str = "-"
    query: ApiQueryOptions = field(default_factory=ApiQueryOptions)
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiEnumValue:
    """Language-neutral enum value fact."""

    value: str
    name: ContractName
    description: str = "-"
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiSchema:
    """Language-neutral schema fact."""

    id: str
    name: ContractName
    kind: str
    ref: str = "-"
    resource: str | None = None
    fields: tuple[ApiField, ...] = ()
    enum_values: tuple[ApiEnumValue, ...] = ()
    is_alias: bool = False
    alias_of: str | None = None
    description: str = "-"
    query: ApiQueryOptions = field(default_factory=ApiQueryOptions)
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiSchemaGroups:
    """Classified schema views for template contracts."""

    all: tuple[ApiSchema, ...] = ()
    models: tuple[ApiSchema, ...] = ()
    dtos: tuple[ApiSchema, ...] = ()
    enums: tuple[ApiSchema, ...] = ()
    primitives: tuple[ApiSchema, ...] = ()
    aliases: tuple[ApiSchema, ...] = ()
    queries: tuple[ApiSchema, ...] = ()
    params: tuple[ApiSchema, ...] = ()
    bodies: tuple[ApiSchema, ...] = ()
    responses: tuple[ApiSchema, ...] = ()

    # default emit views
    emit_models: tuple[ApiSchema, ...] = ()
    emit_dtos: tuple[ApiSchema, ...] = ()
    emit_enums: tuple[ApiSchema, ...] = ()


@dataclass(frozen=True)
class ApiParameter:
    """Language-neutral operation parameter fact."""

    id: str
    name: ContractName
    location: str
    required: bool = False
    api_type: str = "unknown"
    ref: str | None = None
    description: str = "-"
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiRequestBody:
    """Language-neutral request body fact."""

    required: bool = False
    content_types: tuple[str, ...] = ()
    schema_refs: tuple[str, ...] = ()
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiResponse:
    """Language-neutral operation response fact."""

    status_code: str
    description: str = "-"
    content_types: tuple[str, ...] = ()
    schema_refs: tuple[str, ...] = ()
    is_success: bool = False
    is_error: bool = False
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiOperation:
    """Language-neutral operation fact."""

    id: str
    name: ContractName
    method: str
    path: str
    resource: str | None = None
    parameters: tuple[ApiParameter, ...] = ()
    request_body: ApiRequestBody | None = None
    responses: tuple[ApiResponse, ...] = ()
    description: str = "-"
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ApiContract:
    """Stable API contract produced from inference."""

    info: ApiDocumentInfo
    resources: tuple[ApiResource, ...] = ()
    schemas: ApiSchemaGroups = field(default_factory=ApiSchemaGroups)
    operations: tuple[ApiOperation, ...] = ()
    meta: dict[str, Any] = field(default_factory=dict)
