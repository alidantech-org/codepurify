"""Changed-aware file writer."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from codepot.emission.renderer import RenderedFile


@dataclass
class WriteReport:
    """Report from writing rendered files."""

    created: list[Path] = field(default_factory=list)
    updated: list[Path] = field(default_factory=list)
    unchanged: list[Path] = field(default_factory=list)
    dry_run: list[Path] = field(default_factory=list)


def write_rendered_files(files: tuple[RenderedFile, ...], *, dry_run: bool) -> WriteReport:
    """Write rendered files to disk."""

    report = WriteReport()

    for file in files:
        if dry_run:
            report.dry_run.append(file.path)
            continue

        file.path.parent.mkdir(parents=True, exist_ok=True)

        if file.path.exists() and file.path.read_text(encoding="utf-8") == file.content:
            report.unchanged.append(file.path)
            continue

        action = report.updated if file.path.exists() else report.created
        file.path.write_text(file.content, encoding="utf-8")
        action.append(file.path)

    return report
