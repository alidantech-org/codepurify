"""Template command renderers."""

from __future__ import annotations

from rich.table import Table

from app import (
    TemplateInspectResult,
    TemplateSelectionsResult,
    TemplateValidateResult,
    TemplateVarsResult,
)
from cli.presentation.console import console
from cli.presentation.tables import make_issue_table, make_key_value_table


def render_template_validate_result(
    result: TemplateValidateResult,
    *,
    verbose: bool = False,
) -> None:
    table = Table(title="Checks", box=None)
    table.add_column("", style="green", width=2)
    table.add_column("Check", style="cyan")
    table.add_column("Detail", style="dim")
    for check in result.checks:
        marker = "+" if check.ok else "x"
        style = "green" if check.ok else "red"
        table.add_row(f"[{style}]{marker}[/{style}]", check.name, check.detail or "")
    console.print(table)

    if result.errors:
        console.print(make_issue_table("Errors", result.errors))
        return

    if result.warnings and verbose:
        console.print(make_issue_table("Warnings", result.warnings))

    console.print()
    console.print("[green]Template package is valid.[/green]")


def render_template_inspect_result(
    result: TemplateInspectResult,
    *,
    verbose: bool = False,
) -> None:
    console.print(
        make_key_value_table(
            "Template Package",
            (
                ("Path", result.template_package_path),
                ("Name", result.name),
                ("Language", result.language),
                ("Extension", result.extension),
            ),
        ),
    )
    console.print()

    templates = Table(title="Templates")
    templates.add_column("ID", style="cyan")
    templates.add_column("Kind")
    templates.add_column("Select")
    templates.add_column("Template")
    for item in result.templates:
        templates.add_row(item.id, item.kind, item.select, item.template)
    console.print(templates)

    if not result.barrels:
        return

    console.print()
    barrels = Table(title="Barrels")
    barrels.add_column("ID", style="cyan")
    barrels.add_column("Template")
    barrels.add_column("Export")
    for item in result.barrels:
        barrels.add_row(item.id, item.template, item.export)
    console.print(barrels)


def render_template_vars_result(result: TemplateVarsResult, *, verbose: bool = False) -> None:
    console.print(f"[bold]Template Variables  {result.select}[/bold]")
    console.print()
    _render_list("Output path variables", result.output_path_variables)
    console.print()
    _render_list("Template variables", result.template_variables)


def render_template_selections_result(
    result: TemplateSelectionsResult,
    *,
    verbose: bool = False,
) -> None:
    console.print("[bold]Valid selections[/bold]")
    console.print()
    for selection in result.selections:
        console.print(selection)

    if verbose and result.hidden_subjects:
        console.print()
        console.print("[bold]Hidden metadata subjects:[/bold]")
        for subject in result.hidden_subjects:
            console.print(subject)


def _render_list(title: str, values: tuple[str, ...]) -> None:
    console.print(f"[bold]{title}[/bold]")
    for value in values:
        console.print(value)
