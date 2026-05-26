"""Reusable diagnostics rendering helpers."""

from __future__ import annotations

from typing import Any

from cli.presentation.core.console import console
from cli.presentation.core.tables import render_rows_table

_LEVEL_STYLES: dict[str, tuple[str, str]] = {
    "error": ("[bold #E24B4A]", "✗"),
    "warning": ("[bold #EF9F27]", "⚠"),
    "info": ("[bold #378ADD]", "ℹ"),
    "debug": ("[dim]", "·"),
}

_LEVEL_ORDER = {"error": 0, "warning": 1, "info": 2, "debug": 3}


def render_diagnostics(
    diagnostics: list[Any],
    *,
    title: str = "Diagnostics",
    sort: bool = True,
    source_column: bool = False,
) -> None:
    """Render diagnostic objects with level/message (and optional source) fields.

    Parameters
    ----------
    diagnostics:
        Any objects exposing ``level`` and ``message`` attributes. A ``source``
        attribute is rendered as a third column when *source_column* is True.
    title:
        Table heading.
    sort:
        When True (default), rows are ordered errors → warnings → info → debug.
    source_column:
        When True, a third "Source" column is included if any item has a
        non-empty ``source`` attribute.
    """
    if not diagnostics:
        return

    if sort:
        diagnostics = sorted(
            diagnostics,
            key=lambda d: _LEVEL_ORDER.get(str(getattr(d, "level", "")).lower(), 99),
        )

    has_source = source_column and any(getattr(item, "source", None) for item in diagnostics)

    columns = ["Level", "Message", *(["Source"] if has_source else [])]

    rows = [_build_row(item, has_source=has_source) for item in diagnostics]

    counts = _count_levels(diagnostics)
    render_rows_table(title, columns, rows)
    _render_summary(counts)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_row(item: Any, *, has_source: bool) -> tuple[str, ...]:
    level = getattr(item, "level", "-")
    message = getattr(item, "message", "-") or "[dim]—[/dim]"
    row = (_style_level(level), str(message))

    if has_source:
        source = getattr(item, "source", None)
        row += (f"[dim]{source}[/dim]" if source else "[dim]—[/dim]",)

    return row


def _style_level(level: str) -> str:
    normalized = str(level).lower()
    style, icon = _LEVEL_STYLES.get(normalized, ("[dim]", "·"))
    closing = (
        "[/bold #E24B4A]"
        if "E24B4A" in style
        else "[/bold #EF9F27]" if "EF9F27" in style else "[/bold #378ADD]" if "378ADD" in style else "[/dim]"
    )
    label = normalized if normalized in _LEVEL_STYLES else str(level)
    return f"{style}{icon} {label}{closing}"


def _count_levels(diagnostics: list[Any]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for item in diagnostics:
        key = str(getattr(item, "level", "unknown")).lower()
        counts[key] = counts.get(key, 0) + 1
    return counts


def _render_summary(counts: dict[str, int]) -> None:
    if not counts:
        return

    parts: list[str] = []

    for level, color in [("error", "#E24B4A"), ("warning", "#EF9F27"), ("info", "#378ADD")]:
        n = counts.get(level, 0)
        if n:
            _, icon = _LEVEL_STYLES[level]
            parts.append(f"[{color}]{icon} {n} {level}{'s' if n > 1 else ''}[/{color}]")

    if parts:
        console.print("  " + "  [dim]·[/dim]  ".join(parts))
