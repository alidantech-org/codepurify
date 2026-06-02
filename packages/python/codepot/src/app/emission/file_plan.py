"""Emission file plan contracts."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class PlannedFile:
    """One file planned for rendering."""

    path: Path
    template: str
    context: dict[str, Any]


@dataclass(frozen=True)
class FilePlan:
    """All files planned for rendering."""

    files: tuple[PlannedFile, ...]
