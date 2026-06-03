"""Typed output path variable contexts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from contracts.language.runtime import LanguageRuntime
from contracts.spec.names import SpecName
from contracts.spec.records import SpecRecord
from pipeline.planning.selections import PlannedSelection


@dataclass(frozen=True)
class PathNameVariables:
    """Name variables available during output path expansion."""

    raw: str
    clean: str
    pascal: str
    camel: str
    snake: str
    kebab: str
    screaming_snake: str
    constant: str
    path: str


@dataclass(frozen=True)
class PathOwnerVariables:
    """Owner variables available during output path expansion."""

    key: str
    name: PathNameVariables
    folders: tuple[str, ...] = ()


@dataclass(frozen=True)
class PathResourceVariables:
    """Resource variables available during output path expansion."""

    key: str
    name: PathNameVariables
    folders: tuple[str, ...] = ()


@dataclass(frozen=True)
class PathItemVariables:
    """Selected item variables available during output path expansion."""

    id: str
    key: str
    ref: str
    name: PathNameVariables


@dataclass(frozen=True)
class PathTemplateVariables:
    """Template variables available during output path expansion."""

    id: str
    select: str
    kind: str


@dataclass(frozen=True)
class PathLanguageVariables:
    """Language variables available during output path expansion."""

    name: str
    extension: str
    package_name: str | None


@dataclass(frozen=True)
class PathProjectVariables:
    """Project variables available during output path expansion."""

    key: str
    version: str
    title: str


@dataclass(frozen=True)
class PathGlobalVariables:
    """Global variables available during output path expansion."""

    alias: str
    output_root: Path


@dataclass(frozen=True)
class OutputPathVariables:
    """Complete lightweight output path variables."""

    global_context: PathGlobalVariables
    project: PathProjectVariables
    language: PathLanguageVariables
    template: PathTemplateVariables

    item: PathItemVariables | None = None
    owner: PathOwnerVariables | None = None
    resource: PathResourceVariables | None = None


def name_variables(name: SpecName) -> PathNameVariables:
    """Create path name variables from a spec name."""

    return PathNameVariables(
        raw=name.raw,
        clean=name.clean,
        pascal=name.pascal,
        camel=name.camel,
        snake=name.snake,
        kebab=name.kebab,
        screaming_snake=name.screaming_snake,
        constant=name.constant,
        path=name.path,
    )


def item_variables(record: SpecRecord[object]) -> PathItemVariables:
    """Create item path variables from a selected record."""

    return PathItemVariables(
        id=record.id,
        key=record.key,
        ref=record.ref.value,
        name=name_variables(record.name),
    )


def owner_variables(record: SpecRecord[object]) -> PathOwnerVariables | None:
    """Create owner path variables from a selected record."""

    if record.owner is None:
        return None

    return PathOwnerVariables(
        key=record.owner.key,
        name=name_variables(record.owner.name),
        folders=record.owner.folders,
    )


def language_variables(runtime: LanguageRuntime) -> PathLanguageVariables:
    """Create language path variables."""

    return PathLanguageVariables(
        name=runtime.name,
        extension=runtime.extension,
        package_name=runtime.package_name,
    )


def template_variables(selection: PlannedSelection) -> PathTemplateVariables:
    """Create template path variables."""

    return PathTemplateVariables(
        id=selection.template_id,
        select=selection.select.raw,
        kind=selection.template.kind.value,
    )
