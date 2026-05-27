"""Template path authoring contract.

This module defines the stable public rules for template path selection and
dynamic path expansion.

Path syntax:
- `(variable)` selects/loops a configured path variable from paths.yaml.
- `[expression]` emits a dynamic path/file name value.
- `[[...]]` emits literal `[ ... ]`.
- `((...))` emits literal `( ... )`.
- `*.j2` files are rendered and the final `.j2` suffix is stripped.
- non-`.j2` files are copied as raw files.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class PathTokenKind(StrEnum):
    """Supported template path token kinds."""

    SELECTOR = "selector"
    DYNAMIC = "dynamic"
    ESCAPED_SELECTOR = "escaped_selector"
    ESCAPED_DYNAMIC = "escaped_dynamic"
    STATIC = "static"


class PathSelectionMode(StrEnum):
    """How a path variable selects emission contexts."""

    EACH = "each"
    GROUP = "group"
    ONCE = "once"


class PathValueKind(StrEnum):
    """Expected value shape for a resolved path value."""

    ANY = "any"
    SCALAR = "scalar"
    LIST = "list"
    OBJECT = "object"


@dataclass(frozen=True)
class PathExpose:
    """A short variable exposed inside a selected path context."""

    name: str
    expression: str
    value_kind: PathValueKind = PathValueKind.ANY
    description: str = "-"


@dataclass(frozen=True)
class PathVariable:
    """Configured selector variable used by `(variable)` path segments."""

    name: str
    select: str
    alias: str
    mode: PathSelectionMode = PathSelectionMode.EACH
    expose: tuple[PathExpose, ...] = ()
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

    variables: tuple[PathVariable, ...] = ()
    template_extension: str = ".j2"
    strip_template_extension: bool = True
    allow_raw_files: bool = True
    rules: tuple[PathSyntaxRule, ...] = field(default_factory=tuple)
    meta: dict[str, Any] = field(default_factory=dict)

    def variable_by_name(self) -> dict[str, PathVariable]:
        """Return variables keyed by selector name."""
        return {variable.name: variable for variable in self.variables}


def default_path_rules() -> tuple[PathSyntaxRule, ...]:
    """Return default path syntax rules for documentation/debug output."""
    return (
        PathSyntaxRule(
            syntax="(variable)",
            kind=PathTokenKind.SELECTOR,
            description="Select and loop a configured paths.yaml variable. The segment is not emitted.",
            example="(models)/[name.path]/model.txt.j2",
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
            syntax="((value))",
            kind=PathTokenKind.ESCAPED_SELECTOR,
            description="Emit a literal parenthesized value.",
            example="docs/((not-a-selector)).txt.j2",
        ),
    )


def default_path_config() -> PathConfig:
    """Return an empty default path config."""
    return PathConfig(rules=default_path_rules())
