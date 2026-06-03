"""Planned output file models."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from contracts.spec.records import SpecRecord
from contracts.templates.config.selection import TemplateSelect
from contracts.templates.config.template import TemplateEntryConfig
from pipeline.planning.path_debug import PathPlanningDebug


@dataclass(frozen=True)
class PlannedOutputSource:
    """Source data used to create one planned output file."""

    records: tuple[SpecRecord[object], ...]
    bucket_key: str | None = None
    resource_key: str | None = None


@dataclass(frozen=True)
class PlannedOutputFile:
    """One file planned for emission."""

    id: str
    template_id: str
    template: TemplateEntryConfig
    select: TemplateSelect

    output_path: Path
    relative_output_path: str

    source: PlannedOutputSource
    is_barrel: bool = False
    parent_template_id: str | None = None
    path_debug: PathPlanningDebug | None = None
    template_file: str | None = None
    barrel_source_file_ids: tuple[str, ...] = ()
