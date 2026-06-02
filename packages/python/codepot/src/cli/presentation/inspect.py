"""Inspect command renderer."""

from __future__ import annotations

from app import InspectResult
from cli.presentation.console import console
from cli.presentation.tables import make_key_value_table


def render_inspect_result(result: InspectResult) -> None:
    summary = result.summary
    console.print(
        make_key_value_table(
            "Overview",
            (
                ("Spec", result.spec_path),
                ("Version", summary.version),
                ("Schemas", summary.schemas),
                ("Resources", summary.resources),
                ("Properties", summary.properties),
                ("Responses", summary.responses),
                ("Operations", summary.operations),
                ("Content types", summary.content_types),
            ),
        ),
    )

    if result.mode == "overview" or not result.rows:
        return

    table = make_key_value_table(
        result.mode.replace("_", " ").title(),
        tuple(
            (row.get("name", f"row-{index + 1}"), _format_row(row))
            for index, row in enumerate(result.rows)
        ),
    )
    console.print()
    console.print(table)


def _format_row(row: dict[str, object]) -> str:
    return ", ".join(f"{key}={value}" for key, value in row.items() if key != "name")
