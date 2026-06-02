"""Template context contracts.

These models define the stable context passed to template rendering.

The template layer receives already-prepared data. Templates should not resolve
refs, calculate names, compute imports, inspect raw spec models, or decide output
paths. They only render the context described here.

Rules:
- Do not import raw ``spec.ir`` models here.
- Do not calculate imports, paths, names, or types here.
- Do not perform rendering here.
- Emission/context-building code constructs these models.
- Jinja templates consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from contracts.language import (
    LanguageContentType,
    LanguageDto,
    LanguageEnum,
    LanguageExport,
    LanguageImport,
    LanguageModel,
    LanguageParams,
    LanguagePrimitive,
    LanguageResource,
    LanguageSupportFile,
)
from contracts.paths import PathVariables
from contracts.spec import SpecContext, SpecCounts, SpecMetadata


@dataclass(frozen=True)
class TemplateProjectContext:
    """Project metadata exposed to every template."""

    key: str
    title: str
    api_version: str
    spec_version: int
    codepot_version: str
    summary: str | None


@dataclass(frozen=True)
class TemplateRuntimeContext:
    """Runtime/language metadata exposed to every template."""

    language: str
    package_name: str | None
    file_extension: str
    source_root: Path


@dataclass(frozen=True)
class TemplateSpecContext:
    """Spec summary metadata exposed to every template."""

    metadata: SpecMetadata
    counts: SpecCounts


@dataclass(frozen=True)
class TemplateImportsContext:
    """Import/export context exposed to templates."""

    imports: tuple[LanguageImport, ...]
    exports: tuple[LanguageExport, ...]


@dataclass(frozen=True)
class TemplateGlobalContext:
    """Global context available to every rendered template."""

    project: TemplateProjectContext
    runtime: TemplateRuntimeContext
    spec: TemplateSpecContext
    paths: PathVariables
    imports: TemplateImportsContext
    extra: dict[str, Any]


@dataclass(frozen=True)
class TemplateEnumContext:
    """Template context for enum output."""

    global_context: TemplateGlobalContext
    enum: LanguageEnum


@dataclass(frozen=True)
class TemplateModelContext:
    """Template context for model/entity output."""

    global_context: TemplateGlobalContext
    model: LanguageModel


@dataclass(frozen=True)
class TemplateDtoContext:
    """Template context for DTO output."""

    global_context: TemplateGlobalContext
    dto: LanguageDto


@dataclass(frozen=True)
class TemplateParamsContext:
    """Template context for params output."""

    global_context: TemplateGlobalContext
    params: LanguageParams


@dataclass(frozen=True)
class TemplateResourceContext:
    """Template context for resource output."""

    global_context: TemplateGlobalContext
    resource: LanguageResource


@dataclass(frozen=True)
class TemplatePrimitiveContext:
    """Template context for primitive output."""

    global_context: TemplateGlobalContext
    primitive: LanguagePrimitive


@dataclass(frozen=True)
class TemplateContentTypeContext:
    """Template context for content type output."""

    global_context: TemplateGlobalContext
    content_type: LanguageContentType


@dataclass(frozen=True)
class TemplateSupportFileContext:
    """Template context for language support/package/config files."""

    global_context: TemplateGlobalContext
    support_file: LanguageSupportFile


@dataclass(frozen=True)
class TemplateOnceContext:
    """Template context for once-per-run aggregate files."""

    global_context: TemplateGlobalContext
    spec_context: SpecContext

    primitives: tuple[LanguagePrimitive, ...]
    enums: tuple[LanguageEnum, ...]
    models: tuple[LanguageModel, ...]
    dtos: tuple[LanguageDto, ...]
    params: tuple[LanguageParams, ...]
    resources: tuple[LanguageResource, ...]
    content_types: tuple[LanguageContentType, ...]
    support_files: tuple[LanguageSupportFile, ...]


TemplateContext = (
    TemplateEnumContext
    | TemplateModelContext
    | TemplateDtoContext
    | TemplateParamsContext
    | TemplateResourceContext
    | TemplatePrimitiveContext
    | TemplateContentTypeContext
    | TemplateSupportFileContext
    | TemplateOnceContext
)


@dataclass(frozen=True)
class TemplateRenderInput:
    """One prepared template render request."""

    template_path: Path
    output_path: Path
    context: TemplateContext
    context_dict: dict[str, Any]


@dataclass(frozen=True)
class TemplateRenderPlan:
    """All prepared template render requests."""

    items: tuple[TemplateRenderInput, ...]
