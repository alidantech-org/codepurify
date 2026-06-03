"""Validate command presentation."""

from __future__ import annotations

from cli.presentation.console import console
from contracts.spec.context import SpecContext


def print_validate_result(context: SpecContext) -> None:
    """Print spec validation result."""

    metadata = context.metadata
    counts = context.counts

    console.print("[green]✓ Spec validated.[/green]")
    console.print(f"Project: [bold]{metadata.project.project_key}[/bold]")
    console.print(f"Version: {metadata.project.version}")
    console.print(f"Records: {counts.records_total}")
    console.print(f"Resources: {counts.resources}")
    console.print(f"Models: {counts.models}")
    console.print(f"DTOs: {counts.dtos}")
