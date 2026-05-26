"""Deterministic template variable contract.

Templates should consume this contract shape only. Language adapters fill the
`.lang` sections while source API facts remain under `.api`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from contracts.api import (
    ApiContract,
    ApiField,
    ApiOperation,
    ApiParameter,
    ApiResource,
    ApiResponse,
    ApiSchema,
)
from contracts.names import ContractName

MetaMap = dict[str, Any]


@dataclass(frozen=True)
class TemplateProject:
    """Project/package-level template variables."""

    name: ContractName
    version: str = "0.1.0"
    description: str = "-"
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateLanguage:
    """Target language/template profile variables."""

    name: str
    framework: MetaMap = field(default_factory=dict)
    package: MetaMap = field(default_factory=dict)
    features: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateEmit:
    """Emission-level template variables."""

    output_path: Path
    template_root: Path | None = None
    dry_run: bool = False
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateField:
    """Field template variables."""

    api: ApiField
    name: ContractName
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateSchema:
    """Schema template variables."""

    api: ApiSchema
    name: ContractName
    fields: tuple[TemplateField, ...] = ()
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateSchemaGroups:
    """Classified template schema views."""

    all: tuple[TemplateSchema, ...] = ()
    models: tuple[TemplateSchema, ...] = ()
    dtos: tuple[TemplateSchema, ...] = ()
    enums: tuple[TemplateSchema, ...] = ()
    primitives: tuple[TemplateSchema, ...] = ()
    aliases: tuple[TemplateSchema, ...] = ()

    emit_models: tuple[TemplateSchema, ...] = ()
    emit_dtos: tuple[TemplateSchema, ...] = ()
    emit_enums: tuple[TemplateSchema, ...] = ()


@dataclass(frozen=True)
class TemplateResource:
    """Resource template variables."""

    api: ApiResource
    name: ContractName
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateParameter:
    """Operation parameter template variables."""

    api: ApiParameter
    name: ContractName
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateResponse:
    """Operation response template variables."""

    api: ApiResponse
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateOperation:
    """Operation template variables."""

    api: ApiOperation
    name: ContractName
    parameters: tuple[TemplateParameter, ...] = ()
    responses: tuple[TemplateResponse, ...] = ()
    lang: MetaMap = field(default_factory=dict)
    emit: MetaMap = field(default_factory=dict)
    docs: MetaMap = field(default_factory=dict)
    meta: MetaMap = field(default_factory=dict)


@dataclass(frozen=True)
class TemplateContract:
    """Stable contract passed to emission templates."""

    project: TemplateProject
    api: ApiContract
    lang: TemplateLanguage
    emit: TemplateEmit
    resources: tuple[TemplateResource, ...] = ()
    schemas: TemplateSchemaGroups = field(default_factory=TemplateSchemaGroups)
    operations: tuple[TemplateOperation, ...] = ()
    meta: MetaMap = field(default_factory=dict)
