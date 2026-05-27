"""Template path authoring contract.

This module defines the stable public rules for template path selection and
dynamic path expansion.

Path syntax:
- `{folder}` selects/loops a configured folder recipe from paths.yaml and emits its folder parts.
- `[expression]` emits a dynamic path/file name value.
- `[[...]]` emits literal `[ ... ]`.
- `{{...}}` emits literal `{ ... }`.
- `*.j2` files are rendered and the final `.j2` suffix is stripped.
- non-`.j2` files are copied as raw files.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class PathTokenKind(StrEnum):
    """Supported template path token kinds."""

    FOLDER = "folder"
    DYNAMIC = "dynamic"
    ESCAPED_FOLDER = "escaped_folder"
    ESCAPED_DYNAMIC = "escaped_dynamic"
    STATIC = "static"


class PathSelectionMode(StrEnum):
    """How a path folder selects emission contexts."""

    EACH = "each"
    GROUP = "group"
    ONCE = "once"


@dataclass(frozen=True)
class PathFolder:
    """Configured folder recipe used by `{folder}` path segments."""

    name: str
    select: str
    alias: str
    parts: tuple[Any, ...]
    mode: PathSelectionMode = PathSelectionMode.EACH
    description: str = "-"


@dataclass(frozen=True)
class PathToken:
    """Parsed token from a template path part."""

    kind: PathTokenKind
    raw: str
    expression: str = ""


@dataclass(frozen=True)
class PathSyntaxRule:
    """A documented path syntax rule."""

    syntax: str
    kind: PathTokenKind
    description: str
    example: str


@dataclass(frozen=True)
class PathConfig:
    """Resolved path authoring configuration."""

    folders: tuple[PathFolder, ...] = ()
    template_extension: str = ".j2"
    strip_template_extension: bool = True
    allow_raw_files: bool = True
    rules: tuple[PathSyntaxRule, ...] = field(default_factory=tuple)
    meta: dict[str, Any] = field(default_factory=dict)

    def folder_by_name(self) -> dict[str, PathFolder]:
        """Return folder recipes keyed by name."""
        return {folder.name: folder for folder in self.folders}


def default_path_rules() -> tuple[PathSyntaxRule, ...]:
    """Return default path syntax rules for documentation/debug output."""
    return (
        PathSyntaxRule(
            syntax="{folder}",
            kind=PathTokenKind.FOLDER,
            description="Select and loop a configured paths.yaml folder recipe. The segment emits configured folder parts.",
            example="{model}/[model.name.path].md.j2",
        ),
        PathSyntaxRule(
            syntax="[expression]",
            kind=PathTokenKind.DYNAMIC,
            description="Resolve an expression and emit it as a path or file-name value.",
            example="[entity.name.path]/[name.path].txt.j2",
        ),
        PathSyntaxRule(
            syntax="[[value]]",
            kind=PathTokenKind.ESCAPED_DYNAMIC,
            description="Emit a literal bracketed value.",
            example="app/[[...slug]]/page.tsx.j2",
        ),
        PathSyntaxRule(
            syntax="{{value}}",
            kind=PathTokenKind.ESCAPED_FOLDER,
            description="Emit a literal braced value.",
            example="docs/{{not-a-folder}}.txt.j2",
        ),
    )


def default_path_config() -> PathConfig:
    """Return an empty default path config."""
    return PathConfig(rules=default_path_rules())
