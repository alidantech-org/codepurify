"""Shared emission contracts.

Emission consumes TemplateContract and produces plans/results. It does not know
about concrete language implementations.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

TemplateContext = Mapping[str, Any]


@dataclass(frozen=True)
class EmissionFile:
    """One planned or rendered output file."""

    template_path: Path
    output_path: Path
    context: TemplateContext
    content: str | bytes | None = None
    group: str = "global"
    is_template: bool = True
    compare_mode: str = "exact"


@dataclass(frozen=True)
class EmissionPlan:
    """Planned files before writing to disk."""

    language: str
    template_root: Path
    output_root: Path
    files: Sequence[EmissionFile] = field(default_factory=tuple)


@dataclass(frozen=True)
class EmissionWriteResult:
    """Result of writing planned files."""

    created: Sequence[Path] = field(default_factory=tuple)
    updated: Sequence[Path] = field(default_factory=tuple)
    unchanged: Sequence[Path] = field(default_factory=tuple)
    skipped: Sequence[Path] = field(default_factory=tuple)


@dataclass(frozen=True)
class EmissionResult:
    """Complete result returned by the emission engine."""

    plan: EmissionPlan
    write_result: EmissionWriteResult
