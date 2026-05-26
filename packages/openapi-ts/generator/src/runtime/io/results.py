"""Structured runtime result objects.

Runtime methods return these objects so CLI, UI, tests, or APIs can decide how
to present results without runtime depending on terminal formatting.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

MappingLike = dict[str, Any]


@dataclass(frozen=True)
class Diagnostic:
    """A runtime diagnostic message."""

    level: str
    message: str
    details: MappingLike = field(default_factory=dict)


@dataclass(frozen=True)
class InspectResult:
    """Result returned by GeneratorApp.inspect."""

    input_path: Path
    summary: MappingLike
    diagnostics: list[Diagnostic] = field(default_factory=list)


@dataclass(frozen=True)
class InferResult:
    """Result returned by GeneratorApp.infer."""

    input_path: Path
    output_path: Path | None
    graph: Any
    written: list[Path] = field(default_factory=list)
    diagnostics: list[Diagnostic] = field(default_factory=list)


@dataclass(frozen=True)
class EmitResult:
    """Result returned by GeneratorApp.emit."""

    input_path: Path
    language: str
    output_path: Path
    planned: list[Path] = field(default_factory=list)
    written: list[Path] = field(default_factory=list)
    updated: list[Path] = field(default_factory=list)
    skipped: list[Path] = field(default_factory=list)
    diagnostics: list[Diagnostic] = field(default_factory=list)


@dataclass(frozen=True)
class ValidateResult:
    """Result returned by GeneratorApp.validate."""

    input_path: Path
    valid: bool
    errors: list[str] = field(default_factory=list)
    diagnostics: list[Diagnostic] = field(default_factory=list)
