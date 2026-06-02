"""Console rendering primitives."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel

console = Console()
error_console = Console(stderr=True)


def print_header(title: str, subtitle: str | None = None) -> None:
    text = title if subtitle is None else f"[bold]{title}[/bold]  {subtitle}"
    console.print(Panel.fit(text, border_style="blue"))


def print_success(message: str) -> None:
    console.print(f"[green]+[/green] {message}")


def print_warning(message: str) -> None:
    console.print(f"[yellow]Warning:[/yellow] {message}")


def print_error(message: str) -> None:
    error_console.print(f"[red]Error:[/red] {message}")


def print_info(message: str) -> None:
    console.print(message)
