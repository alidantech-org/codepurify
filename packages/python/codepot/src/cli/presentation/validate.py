"""Validate command renderer."""

from __future__ import annotations

from app import ValidateResult
from cli.presentation.console import console, print_success, print_warning
from cli.presentation.tables import make_issue_table


def render_validate_result(result: ValidateResult, *, verbose: bool = False) -> None:
    for check in result.checks:
        suffix = f"  {check.detail}" if verbose and check.detail else ""
        print_success(f"{check.name}{suffix}")

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
