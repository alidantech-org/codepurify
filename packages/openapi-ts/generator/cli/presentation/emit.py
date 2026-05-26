"""Presentation helpers for emit results."""

from __future__ import annotations

from rich.table import Table

from cli.presentation.console import console


def render_emit_result(result, *, verbose: bool = False) -> None:
    """Render an EmitResult-like object."""
    table = Table(title="Emit Summary")
    table.add_column("Metric")
    table.add_column("Value", justify="right")

    table.add_row("Language", str(getattr(result, "language", "-")))
    table.add_row("Output", str(getattr(result, "output_path", "-")))
    table.add_row("Planned", str(len(getattr(result, "planned", []))))
    table.add_row("Written", str(len(getattr(result, "written", []))))
    table.add_row("Updated", str(len(getattr(result, "updated", []))))
    table.add_row("Skipped", str(len(getattr(result, "skipped", []))))

    console.print(table)

    if verbose:
        _render_files("Written", getattr(result, "written", []))
        _render_files("Updated", getattr(result, "updated", []))
        _render_files("Skipped", getattr(result, "skipped", []))


def _render_files(title: str, files) -> None:
    if not files:
        return

    table = Table(title=title)
    table.add_column("Path")

    for path in files:
        table.add_row(str(path))

    console.print(table)
