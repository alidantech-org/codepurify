"""Language-adapted context contracts.

These models define the stable output of language adapters.

The spec repository returns normalized spec context models from ``contracts.spec``.
Language adapters then enrich those records with language-specific names, types,
imports, module paths, file extensions, and runtime conventions.

Rules:
- Do not import raw ``spec.ir`` models here.
- Do not calculate imports or names here.
- Do not render templates here.
- Language adapters construct these models.
- Planning, emission, and templates consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any

from contracts.spec import (
    SpecArray,
    SpecContentType,
    SpecDto,
    SpecEntity,
    SpecEnum,
    SpecFieldKind,
    SpecFieldOptions,
    SpecModel,
    SpecName,
    SpecOperation,
    SpecParams,
    SpecPrimitive,
    SpecRecord,
    SpecRef,
    SpecResource,
    SpecRouteMethod,
    SpecRoutePath,
)


class LanguageItemKind(StrEnum):
    """Kinds of language-adapted items."""

    PRIMITIVE = "primitive"
    ENUM = "enum"
    COMPOSITE = "composite"
    ENTITY = "entity"
    MODEL = "model"
    DTO = "dto"
    PARAMS = "params"
    RESOURCE = "resource"
    OPERATION = "operation"
    ROUTE = "route"
    CONTENT_TYPE = "content_type"
    SUPPORT_FILE = "support_file"
    PACKAGE_FILE = "package_file"


class LanguageTypeKind(StrEnum):
    """Kinds of language type expressions."""

    PRIMITIVE = "primitive"
    ENUM = "enum"
    CLASS = "class"
    ARRAY = "array"
    MAP = "map"
    UNION = "union"
    OPTIONAL = "optional"
    DYNAMIC = "dynamic"
    VOID = "void"
    UNKNOWN = "unknown"


class LanguageImportKind(StrEnum):
    """Kinds of import sources."""

    STANDARD = "standard"
    PACKAGE = "package"
    LOCAL = "local"
    RELATIVE = "relative"
    GENERATED = "generated"


class LanguageExportKind(StrEnum):
    """Kinds of export targets."""

    LOCAL = "local"
    PACKAGE = "package"
    BARREL = "barrel"


class LanguageFileKind(StrEnum):
    """Kinds of language output files."""

    SOURCE = "source"
    BARREL = "barrel"
    PACKAGE = "package"
    CONFIG = "config"
    TEST = "test"
    DOCS = "docs"


@dataclass(frozen=True)
class LanguageName:
    """Language-safe name variants for one item.

    ``spec`` keeps the original normalized name. The rest are language-safe.
    """

    spec: SpecName
    raw: str
    safe: str
    class_name: str
    field_name: str
    variable_name: str
    function_name: str
    constant_name: str
    module_name: str
    file_name: str
    package_name: str | None = None
    escaped: bool = False
    escape_reason: str | None = None


@dataclass(frozen=True)
class LanguagePath:
    """Language-resolved module and file path data."""

    module_parts: tuple[str, ...]
    module_path: str
    import_path: str
    output_parts: tuple[str, ...]
    output_path: Path


@dataclass(frozen=True)
class LanguageType:
    """Language-specific type expression."""

    kind: LanguageTypeKind
    display: str
    annotation: str
    nullable: bool = False
    optional: bool = False
    array: SpecArray | None = None
    item_type: LanguageType | None = None
    key_type: LanguageType | None = None
    value_type: LanguageType | None = None
    union_types: tuple[LanguageType, ...] = ()
    source_ref: SpecRef | None = None


@dataclass(frozen=True)
class LanguageImport:
    """Language import prepared by the language adapter."""

    kind: LanguageImportKind
    module: str
    symbols: tuple[str, ...] = ()
    alias: str | None = None
    is_type_only: bool = False
    required: bool = True


@dataclass(frozen=True)
class LanguageExport:
    """Language export prepared by the language adapter."""

    kind: LanguageExportKind
    module: str
    symbols: tuple[str, ...] = ()
    alias: str | None = None


@dataclass(frozen=True)
class LanguageDoc:
    """Language-ready documentation/comment context."""

    summary: str | None = None
    description: str | None = None
    deprecated: bool = False
    tags: tuple[str, ...] = ()


@dataclass(frozen=True)
class LanguageField:
    """Language-adapted field context."""

    spec_record: SpecRecord
    name: LanguageName
    type: LanguageType
    options: SpecFieldOptions
    kind: SpecFieldKind
    doc: LanguageDoc
    source_ref: SpecRef | None = None
    relation_target: SpecRef | None = None
    default_value: Any | None = None


@dataclass(frozen=True)
class LanguageEnumValue:
    """Language-adapted enum value."""

    spec_record: SpecRecord
    name: LanguageName
    value: str | int | float
    label: str | None
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguagePrimitive:
    """Language-adapted primitive property."""

    spec: SpecPrimitive
    name: LanguageName
    type: LanguageType
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguageEnum:
    """Language-adapted enum."""

    spec: SpecEnum
    name: LanguageName
    path: LanguagePath
    values: tuple[LanguageEnumValue, ...]
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguageModel:
    """Language-adapted model/class-like schema."""

    spec: SpecModel | SpecEntity
    item_kind: LanguageItemKind
    name: LanguageName
    path: LanguagePath
    fields: tuple[LanguageField, ...]
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]
    extends: LanguageType | None
    implements: tuple[LanguageType, ...]
    doc: LanguageDoc
    partial: bool = False
    abstract: bool = False


@dataclass(frozen=True)
class LanguageDto:
    """Language-adapted DTO schema."""

    spec: SpecDto
    name: LanguageName
    path: LanguagePath
    fields: tuple[LanguageField, ...]
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]
    extends: LanguageType | None
    doc: LanguageDoc
    partial: bool = False


@dataclass(frozen=True)
class LanguageParams:
    """Language-adapted params schema."""

    spec: SpecParams
    name: LanguageName
    path: LanguagePath
    field_type: LanguageType
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguageOperationInput:
    """Language-adapted operation input context."""

    context_types: tuple[LanguageType, ...]
    params_type: LanguageType | None
    query_type: LanguageType | None
    body_type: LanguageType | None


@dataclass(frozen=True)
class LanguageOperationOutput:
    """Language-adapted operation output context."""

    result_type: LanguageType | None
    error_types: tuple[LanguageType, ...]


@dataclass(frozen=True)
class LanguageOperation:
    """Language-adapted resource operation."""

    spec: SpecOperation
    name: LanguageName
    input: LanguageOperationInput
    output: LanguageOperationOutput
    imports: tuple[LanguageImport, ...]
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguageRouteMethod:
    """Language-adapted route method."""

    spec: SpecRouteMethod
    method_name: LanguageName
    operation: LanguageOperation
    imports: tuple[LanguageImport, ...]


@dataclass(frozen=True)
class LanguageRoutePath:
    """Language-adapted route path."""

    spec: SpecRoutePath
    path_constant_name: LanguageName
    methods: tuple[LanguageRouteMethod, ...]


@dataclass(frozen=True)
class LanguageResource:
    """Language-adapted resource."""

    spec: SpecResource
    name: LanguageName
    path: LanguagePath
    operations: tuple[LanguageOperation, ...]
    routes: tuple[LanguageRoutePath, ...]
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]
    doc: LanguageDoc


@dataclass(frozen=True)
class LanguageContentType:
    """Language-adapted content type context."""

    spec: SpecContentType
    name: LanguageName
    constant_name: str
    media_type_literal: str
    strategy_literal: str


@dataclass(frozen=True)
class LanguageSupportFile:
    """Language-provided support/package/config file context."""

    kind: LanguageFileKind
    name: str
    path: LanguagePath
    template: str
    context: dict[str, Any]


@dataclass(frozen=True)
class LanguageRuntime:
    """Language runtime/package conventions."""

    language: str
    package_name: str | None
    file_extension: str
    source_root: Path
    supports_classes: bool
    supports_enums: bool
    supports_nullability: bool
    supports_generics: bool


@dataclass(frozen=True)
class LanguagePlan:
    """Complete language-adapted context for planning and templates."""

    runtime: LanguageRuntime

    primitives: tuple[LanguagePrimitive, ...]
    enums: tuple[LanguageEnum, ...]
    models: tuple[LanguageModel, ...]
    dtos: tuple[LanguageDto, ...]
    params: tuple[LanguageParams, ...]
    resources: tuple[LanguageResource, ...]
    content_types: tuple[LanguageContentType, ...]

    support_files: tuple[LanguageSupportFile, ...]
    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]

    all_items: tuple[object, ...]
