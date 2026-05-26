"""Shared Rich console for CLI presentation."""

from __future__ import annotations

from rich.console import Console

console = Console()
error_console = Console(stderr=True)


def print_header(title: str, detail: str | None = None) -> None:
    """Print a CLI header."""
    if detail:
        console.rule(f"[bold cyan]{title}[/bold cyan] [dim]{detail}[/dim]")
        return

    console.rule(f"[bold cyan]{title}[/bold cyan]")


def print_error(message: str) -> None:
    """Print a CLI error."""
    error_console.print(f"[bold red]Error:[/bold red] {message}")
