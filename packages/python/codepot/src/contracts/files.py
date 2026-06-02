"""File emission contracts.

These models define file-level context used by emission, rendering, writing,
dry-runs, and CLI reporting.

Rules:
- Do not render templates here.
- Do not write files here.
- Do not calculate language-specific imports or names here.
- Emission code constructs these models.
- CLI and app result models may consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any

from contracts.paths import PlannedPath
from contracts.templates import TemplateContext


class FileKind(StrEnum):
    """Kinds of generated files."""

    SOURCE = "source"
    BARREL = "barrel"
    PACKAGE = "package"
    CONFIG = "config"
    TEST = "test"
    DOCS = "docs"
    ASSET = "asset"
    OTHER = "other"


class FileWriteStatus(StrEnum):
    """Write status for one file."""

    PLANNED = "planned"
    CREATED = "created"
    UPDATED = "updated"
    UNCHANGED = "unchanged"
    SKIPPED = "skipped"
    FAILED = "failed"


class FileConflictStrategy(StrEnum):
    """How writer handles existing files."""

    SKIP = "skip"
    OVERWRITE = "overwrite"
    UPDATE_IF_CHANGED = "update_if_changed"


@dataclass(frozen=True)
class FileMetadata:
    """Metadata for an existing or generated file."""

    path: Path
    exists: bool
    size_bytes: int | None = None
    size_label: str | None = None
    line_count: int | None = None


@dataclass(frozen=True)
class PlannedFile:
    """A file planned for generation before template rendering."""

    kind: FileKind
    output_path: Path
    template_path: Path
    planned_path: PlannedPath
    context: TemplateContext
    context_dict: dict[str, Any]


@dataclass(frozen=True)
class FilePlan:
    """Full file plan before rendering."""

    files: tuple[PlannedFile, ...]


@dataclass(frozen=True)
class RenderedFile:
    """A rendered file before writing."""

    kind: FileKind
    output_path: Path
    template_path: Path
    content: str
    planned_file: PlannedFile


@dataclass(frozen=True)
class RenderedFilePlan:
    """All rendered files before writing."""

    files: tuple[RenderedFile, ...]


@dataclass(frozen=True)
class FileWriteResult:
    """Write result for one rendered or planned file."""

    path: Path
    status: FileWriteStatus
    kind: FileKind
    template_path: Path | None = None
    message: str | None = None
    error: str | None = None


@dataclass(frozen=True)
class FileWriteReport:
    """Write report for an emission run."""

    dry_run: bool
    results: tuple[FileWriteResult, ...]

    @property
    def planned(self) -> tuple[FileWriteResult, ...]:
        """Return planned file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.PLANNED)

    @property
    def created(self) -> tuple[FileWriteResult, ...]:
        """Return created file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.CREATED)

    @property
    def updated(self) -> tuple[FileWriteResult, ...]:
        """Return updated file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.UPDATED)

    @property
    def unchanged(self) -> tuple[FileWriteResult, ...]:
        """Return unchanged file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.UNCHANGED)

    @property
    def skipped(self) -> tuple[FileWriteResult, ...]:
        """Return skipped file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.SKIPPED)

    @property
    def failed(self) -> tuple[FileWriteResult, ...]:
        """Return failed file results."""

        return tuple(item for item in self.results if item.status == FileWriteStatus.FAILED)

    @property
    def total(self) -> int:
        """Return total processed file count."""

        return len(self.results)

    @property
    def has_errors(self) -> bool:
        """Return true when any file failed."""

        return bool(self.failed)
