"""Validation summary rendering."""

from __future__ import annotations

from cli.presentation.core.console import console


def render_validate_summary(result) -> None:
    """Render validation status."""
    valid = bool(getattr(result, "valid", False))

    if valid:
        console.print("[bold green]✓ Validation passed[/bold green]")
        return

    console.print("[bold red]✗ Validation failed[/bold red]")
