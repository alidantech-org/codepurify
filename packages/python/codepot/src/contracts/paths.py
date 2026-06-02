"""Path planning context contracts.

These models define the stable path context produced by the pathing pipeline.

Pathing is responsible for turning selected spec/language items into planned
path variables and output path decisions. This module only defines the shape of
that context.

Rules:
- Do not import raw ``spec.ir`` models here.
- Do not calculate paths here.
- Do not render templates here.
- Pathing code constructs these models.
- Emission and templates consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any

from contracts.language import LanguageItemKind, LanguageName
from contracts.spec import SpecIdentity, SpecName, SpecRecordKind, SpecRef


class PathSelectKind(StrEnum):
    """Predetermined selectable item groups for path config."""

    ONCE = "once"

    URLS = "urls"
    CONTENT_TYPES = "content_types"

    PRIMITIVES = "primitives"
    ENUMS = "enums"
    COMPOSITES = "composites"

    ENTITIES = "entities"
    FIELD_SETS = "field_sets"
    MODELS = "models"
    DTOS = "dtos"
    PARAMS = "params"

    RESOURCES = "resources"
    OPERATIONS = "operations"
    ROUTES = "routes"
    ERROR_RESPONSES = "error_responses"

    SECURITY_CREDENTIALS = "security_credentials"
    SECURITY_PRINCIPALS = "security_principals"
    SECURITY_POLICIES = "security_policies"


class PathBranchKind(StrEnum):
    """Supported path branching/grouping strategies."""

    ONCE = "once"
    FLAT = "flat"
    BY_OWNER = "by_owner"
    BY_RESOURCE = "by_resource"
    BY_IDENTITY = "by_identity"
    BY_FOLDER = "by_folder"
    BY_KIND = "by_kind"


class PathOutputKind(StrEnum):
    """Kinds of output paths."""

    FILE = "file"
    DIRECTORY = "directory"


class PathTemplateVariableScope(StrEnum):
    """Known variable scopes exposed to output path patterns and templates."""

    PROJECT = "project"
    GROUP = "group"
    ITEM = "item"
    OWNER = "owner"
    LANGUAGE = "language"
    SPEC = "spec"
    PATH = "path"


@dataclass(frozen=True)
class PathGroupConfig:
    """One paths.yaml group entry."""

    id: str
    select: PathSelectKind
    branch: PathBranchKind
    template: str | None
    output: str
    copy: str | None = None
    kind: str | None = None
    enabled: bool = True
    description: str | None = None


@dataclass(frozen=True)
class PathConfig:
    """Full paths.yaml config contract."""

    version: int
    groups: tuple[PathGroupConfig, ...]


@dataclass(frozen=True)
class PathOwnerContext:
    """Owner context for records that belong to another record."""

    ref: SpecRef
    kind: SpecRecordKind | None
    key: str
    identity: SpecIdentity
    name: SpecName | LanguageName


@dataclass(frozen=True)
class PathItemContext:
    """Selected item context used for path planning."""

    ref: SpecRef | None
    kind: SpecRecordKind | LanguageItemKind | None
    key: str | None
    identity: SpecIdentity | None
    spec_name: SpecName | None
    language_name: LanguageName | None
    owner: PathOwnerContext | None
    source: object | None


@dataclass(frozen=True)
class PathLanguageContext:
    """Language path context exposed to path patterns."""

    name: str
    file_extension: str
    source_root: Path
    package_name: str | None


@dataclass(frozen=True)
class PathProjectContext:
    """Project/spec path context exposed to path patterns."""

    key: str
    title: str
    version: str
    spec_version: int


@dataclass(frozen=True)
class PathGroupContext:
    """Path group context exposed to path patterns."""

    id: str
    select: PathSelectKind
    branch: PathBranchKind
    template: str
    output_pattern: str


@dataclass(frozen=True)
class PathVariables:
    """Fully prepared variables for a single path-planned item."""

    project: PathProjectContext
    group: PathGroupContext
    item: PathItemContext
    language: PathLanguageContext
    owner: PathOwnerContext | None
    extra: dict[str, Any]


@dataclass(frozen=True)
class PlannedPath:
    """Resolved path decision before file rendering."""

    kind: PathOutputKind
    output_path: Path
    template_path: Path
    variables: PathVariables


@dataclass(frozen=True)
class PathPlan:
    """All path decisions produced by path planning."""

    config: PathConfig
    paths: tuple[PlannedPath, ...]
