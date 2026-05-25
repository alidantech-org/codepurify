from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich.theme import Theme

_THEME = Theme(
    {
        "title": "bold cyan",
        "success": "bold green",
        "warning": "bold yellow",
        "error": "bold red",
        "muted": "dim",
        "path": "magenta",
        "command": "bold blue",
    }
)

console = Console(theme=_THEME)


def print_header(title: str, subtitle: str | None = None) -> None:
    body = f"[title]{title}[/title]"
    if subtitle:
        body += f"\n[muted]{subtitle}[/muted]"

    console.print(
        Panel.fit(
            body,
            border_style="cyan",
            padding=(1, 3),
        )
    )


def info(message: str) -> None:
    console.print(f"[cyan]›[/cyan] {message}")


def success(message: str) -> None:
    console.print(f"[success]✓[/success] {message}")


def warning(message: str) -> None:
    console.print(f"[warning]⚠[/warning] {message}")


def error(message: str) -> None:
    console.print(f"[error]✗[/error] {message}")


def debug(message: str, enabled: bool = False) -> None:
    if enabled:
        console.print(f"[muted]debug:[/muted] {message}")


@contextmanager
def step(message: str) -> Iterator[None]:
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
        transient=True,
    ) as progress:
        progress.add_task(message, total=None)
        yield


def key_value_table(title: str, rows: list[tuple[str, object]]) -> None:
    table = Table(title=title, show_header=True, header_style="bold cyan")
    table.add_column("Key", style="muted")
    table.add_column("Value")

    for key, value in rows:
        table.add_row(str(key), str(value))

    console.print(table)
