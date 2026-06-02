"""Template rendering helpers."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from codepot.emission.file_plan import FilePlan


@dataclass(frozen=True)
class RenderedFile:
    """Rendered file content."""

    path: Path
    content: str


def render_fake_file_plan(file_plan: FilePlan) -> tuple[RenderedFile, ...]:
    """Render placeholder files without templates yet."""

    return tuple(
        RenderedFile(path=file.path, content=f"# generated from {file.template}\n")
        for file in file_plan.files
    )
