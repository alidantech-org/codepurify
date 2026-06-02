"""Inspect command renderer."""

from __future__ import annotations

from rich.table import Table

from app import InspectResult
from cli.presentation.console import console
from cli.presentation.tables import make_issue_table, make_key_value_table


def render_inspect_result(result: InspectResult) -> None:
    if result.errors:
        console.print(make_issue_table("Errors", result.errors))
        return

    metadata = result.metadata
    counts = result.counts
    if metadata is None or counts is None:
        _render_legacy_summary(result)
        return

    console.print(
        make_key_value_table(
            "Codepot Spec",
            (
                ("Title", metadata.title),
                ("Project key", metadata.project_key),
                ("Spec version", metadata.spec_version),
                ("API version", metadata.api_version),
                ("Codepot IR", metadata.codepot_version),
                ("File", metadata.file_path),
                ("Size", metadata.file_size_label),
                ("Lines", f"{metadata.line_count:,}"),
                ("URLs", metadata.urls_count),
            ),
        ),
    )
    if metadata.summary:
        console.print(f"[dim]{metadata.summary}[/dim]")
    console.print()
    console.print(
        make_key_value_table(
            "Registry",
            (
                ("Content types", counts.content_types),
                ("Primitives", counts.primitives),
                ("Enums", counts.enums),
                ("Composites", counts.composites),
                ("Entities", counts.entities),
                ("Field sets", counts.field_sets),
                ("Models", counts.models),
                ("DTOs", counts.dtos),
                ("Params", counts.params),
                ("Resources", counts.resources),
                ("Operations", counts.operations),
                ("Routes", counts.routes),
                ("Responses", counts.responses),
                ("Security", counts.security),
                ("URLs", counts.urls),
            ),
        ),
    )

    if result.mode == "overview" or not result.rows:
        return

    console.print()
    if result.mode == "schemas":
        _render_schema_rows(result, counts.schemas)
    elif result.mode == "resources":
        _render_resource_rows(result, counts.resources)
    elif result.mode == "content_types":
        _render_content_type_rows(result, counts.content_types)
    else:
        _render_generic_rows(result)


def _render_legacy_summary(result: InspectResult) -> None:
    summary = result.summary
    console.print(
        make_key_value_table(
            "Overview",
            (
                ("Spec", result.spec_path),
                ("Version", summary.version),
                ("Content types", summary.content_types),
                ("Primitives", summary.primitives),
                ("Enums", summary.enums),
                ("Composites", summary.composites),
                ("Entities", summary.entities),
                ("Field sets", summary.field_sets),
                ("Models", summary.models),
                ("Dtos", summary.dtos),
                ("Params", summary.params),
                ("Resources", summary.resources),
                ("Operations", summary.operations),
                ("Routes", summary.routes),
                ("Responses", summary.responses),
                ("Security", summary.security),
            ),
        ),
    )

    if result.mode == "overview" or not result.rows:
        return

    console.print()
    _render_generic_rows(result)


def _render_schema_rows(result: InspectResult, total: int) -> None:
    table = Table(title=f"Schemas  {total:,} total")
    table.add_column("Registry", style="cyan")
    table.add_column("Count", justify="right")
    for row in result.rows:
        table.add_row(str(row.get("name", "")), str(row.get("count", "")))
    console.print(table)


def _render_resource_rows(result: InspectResult, total: int) -> None:
    table = Table(title=f"Resources  {total:,} total")
    table.add_column("Key", style="cyan")
    table.add_column("Base path")
    table.add_column("Routes", justify="right")
    table.add_column("Operations", justify="right")
    for row in result.rows:
        table.add_row(
            str(row.get("name", "")),
            str(row.get("base_path", "")),
            str(row.get("routes", "")),
            str(row.get("operations", "")),
        )
    console.print(table)


def _render_content_type_rows(result: InspectResult, total: int) -> None:
    table = Table(title=f"Content Types  {total:,} total")
    table.add_column("Key", style="cyan")
    table.add_column("Type")
    table.add_column("Strategy")
    for row in result.rows:
        table.add_row(
            str(row.get("name", "")),
            str(row.get("type", "")),
            str(row.get("strategy", "")),
        )
    console.print(table)


def _render_generic_rows(result: InspectResult) -> None:
    table = make_key_value_table(
        result.mode.replace("_", " ").title(),
        tuple(
            (row.get("name", f"row-{index + 1}"), _format_row(row))
            for index, row in enumerate(result.rows)
        ),
    )
    console.print(table)


def _format_row(row: dict[str, object]) -> str:
    return ", ".join(f"{key}={value}" for key, value in row.items() if key != "name")
