"""Validate command renderer."""

from __future__ import annotations

from rich.table import Table

from app import ValidateResult
from cli.presentation.console import console, print_warning
from cli.presentation.tables import make_issue_table


def render_validate_result(result: ValidateResult, *, verbose: bool = False) -> None:
    table = Table(title="Checks", box=None)
    table.add_column("", style="green", width=2)
    table.add_column("Check", style="cyan")
    table.add_column("Detail", style="dim")

    for check in result.checks:
        marker = "+" if check.ok else "x"
        style = "green" if check.ok else "red"
        table.add_row(f"[{style}]{marker}[/{style}]", check.name, check.detail or "")

    console.print(table)

    if result.warnings:
        console.print(make_issue_table("Warnings", result.warnings))
    for warning in result.warnings:
        if not verbose:
            print_warning(warning.message)

    if result.errors:
        console.print(make_issue_table("Errors", result.errors))
        return

    console.print()
    console.print("[green]Spec is valid.[/green]")
