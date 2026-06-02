"""Run report contracts.

These models define high-level reports returned by application workflows and
pipeline runs. They are designed for CLI rendering, JSON output, test assertions,
and future CI integrations.

Rules:
- Do not import raw ``spec.ir`` models here.
- Do not perform pipeline work here.
- Do not render CLI output here.
- App and pipeline code construct these models.
- CLI and API callers consume these models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from typing import Any

from contracts.files import FilePlan, FileWriteReport, RenderedFilePlan
from contracts.planning import GenerationPlan
from contracts.spec import (
    SpecContext,
    SpecCounts,
    SpecMetadata,
    SpecRecordKind,
)
from contracts.templates import TemplateRenderPlan


class ReportStatus(StrEnum):
    """High-level workflow status."""

    SUCCESS = "success"
    WARNING = "warning"
    FAILED = "failed"
    SKIPPED = "skipped"


class ReportIssueLevel(StrEnum):
    """Severity for workflow issues."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ReportIssueKind(StrEnum):
    """Kinds of workflow issues."""

    CONFIG = "config"
    FILESYSTEM = "filesystem"
    SPEC_LOAD = "spec_load"
    SPEC_VALIDATION = "spec_validation"
    REF_RESOLUTION = "ref_resolution"
    PLANNING = "planning"
    LANGUAGE = "language"
    TEMPLATE = "template"
    RENDERING = "rendering"
    WRITING = "writing"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class ReportIssue:
    """One issue encountered during a command/workflow."""

    level: ReportIssueLevel
    kind: ReportIssueKind
    message: str
    location: str | None = None
    detail: str | None = None


@dataclass(frozen=True)
class ReportCheck:
    """One successful or failed check shown by validate/status output."""

    label: str
    ok: bool
    detail: str | None = None
    issue: ReportIssue | None = None


@dataclass(frozen=True)
class ReportTiming:
    """Simple timing information for one pipeline stage."""

    stage: str
    elapsed_ms: float


@dataclass(frozen=True)
class ReportCommandContext:
    """Command/runtime inputs captured for reporting."""

    command: str
    spec_path: Path
    language: str | None = None
    templates_path: Path | None = None
    output_path: Path | None = None
    only: tuple[str, ...] = ()
    dry_run: bool = False
    strict: bool = False
    force: bool = False
    verbose: bool = False


@dataclass(frozen=True)
class ValidateReport:
    """Report returned by validate workflow."""

    status: ReportStatus
    command: ReportCommandContext
    metadata: SpecMetadata | None
    counts: SpecCounts | None
    checks: tuple[ReportCheck, ...]
    issues: tuple[ReportIssue, ...] = ()
    timings: tuple[ReportTiming, ...] = ()

    @property
    def ok(self) -> bool:
        """Return true when validation succeeded."""

        return self.status == ReportStatus.SUCCESS


@dataclass(frozen=True)
class InspectSection:
    """One inspect section with generic rows."""

    title: str
    rows: tuple[dict[str, Any], ...]


@dataclass(frozen=True)
class InspectReport:
    """Report returned by inspect workflow."""

    status: ReportStatus
    command: ReportCommandContext
    mode: str
    spec_context: SpecContext | None
    metadata: SpecMetadata | None
    counts: SpecCounts | None
    sections: tuple[InspectSection, ...]
    issues: tuple[ReportIssue, ...] = ()
    timings: tuple[ReportTiming, ...] = ()


@dataclass(frozen=True)
class InferReport:
    """Report returned by infer workflow."""

    status: ReportStatus
    command: ReportCommandContext
    spec_context: SpecContext | None
    generation_plan: GenerationPlan | None
    template_plan: TemplateRenderPlan | None
    file_plan: FilePlan | None
    issues: tuple[ReportIssue, ...] = ()
    timings: tuple[ReportTiming, ...] = ()


@dataclass(frozen=True)
class EmitReport:
    """Report returned by emit workflow."""

    status: ReportStatus
    command: ReportCommandContext
    spec_context: SpecContext | None
    generation_plan: GenerationPlan | None
    template_plan: TemplateRenderPlan | None
    file_plan: FilePlan | None
    rendered_plan: RenderedFilePlan | None
    write_report: FileWriteReport | None
    issues: tuple[ReportIssue, ...] = ()
    timings: tuple[ReportTiming, ...] = ()


@dataclass(frozen=True)
class RecordInspectReport:
    """Focused inspect report for one record kind."""

    status: ReportStatus
    command: ReportCommandContext
    record_kind: SpecRecordKind
    rows: tuple[dict[str, Any], ...]
    issues: tuple[ReportIssue, ...] = ()
