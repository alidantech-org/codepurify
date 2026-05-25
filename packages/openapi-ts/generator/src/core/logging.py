from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich.theme import Theme

from constants.logging import (
    BORDER_STYLE_CYAN,
    COLUMN_KEY,
    COLUMN_VALUE,
    DEBUG_PREFIX,
    PADDING,
    STYLE_COMMAND,
    STYLE_ERROR,
    STYLE_MUTED,
    STYLE_PATH,
    STYLE_SUCCESS,
    STYLE_TITLE,
    STYLE_WARNING,
    STYLE_VALUE_BOLD_BLUE,
    STYLE_VALUE_BOLD_CYAN,
    STYLE_VALUE_BOLD_GREEN,
    STYLE_VALUE_BOLD_RED,
    STYLE_VALUE_BOLD_YELLOW,
    STYLE_VALUE_DIM,
    STYLE_VALUE_MAGENTA,
    SYMBOL_ERROR,
    SYMBOL_INFO,
    SYMBOL_SUCCESS,
    SYMBOL_WARNING,
    TAG_CYAN_CLOSE,
    TAG_CYAN_OPEN,
    TAG_ERROR_CLOSE,
    TAG_ERROR_OPEN,
    TAG_MUTED_CLOSE,
    TAG_MUTED_OPEN,
    TAG_PROGRESS_DESCRIPTION,
    TAG_SUCCESS_CLOSE,
    TAG_SUCCESS_OPEN,
    TAG_TITLE_CLOSE,
    TAG_TITLE_OPEN,
    TAG_WARNING_CLOSE,
    TAG_WARNING_OPEN,
)

_THEME = Theme(
    {
        STYLE_TITLE: STYLE_VALUE_BOLD_CYAN,
        STYLE_SUCCESS: STYLE_VALUE_BOLD_GREEN,
        STYLE_WARNING: STYLE_VALUE_BOLD_YELLOW,
        STYLE_ERROR: STYLE_VALUE_BOLD_RED,
        STYLE_MUTED: STYLE_VALUE_DIM,
        STYLE_PATH: STYLE_VALUE_MAGENTA,
        STYLE_COMMAND: STYLE_VALUE_BOLD_BLUE,
    }
)

console = Console(theme=_THEME)


def print_header(title: str, subtitle: str | None = None) -> None:
    body = f"{TAG_TITLE_OPEN}{title}{TAG_TITLE_CLOSE}"
    if subtitle:
        body += f"\n{TAG_MUTED_OPEN}{subtitle}{TAG_MUTED_CLOSE}"

    console.print(
        Panel.fit(
            body,
            border_style=BORDER_STYLE_CYAN,
            padding=PADDING,
        )
    )


def info(message: str) -> None:
    console.print(f"{TAG_CYAN_OPEN}{SYMBOL_INFO}{TAG_CYAN_CLOSE} {message}")


def success(message: str) -> None:
    console.print(f"{TAG_SUCCESS_OPEN}{SYMBOL_SUCCESS}{TAG_SUCCESS_CLOSE} {message}")


def warning(message: str) -> None:
    console.print(f"{TAG_WARNING_OPEN}{SYMBOL_WARNING}{TAG_WARNING_CLOSE} {message}")


def error(message: str) -> None:
    console.print(f"{TAG_ERROR_OPEN}{SYMBOL_ERROR}{TAG_ERROR_CLOSE} {message}")


def debug(message: str, enabled: bool = False) -> None:
    if enabled:
        console.print(f"{TAG_MUTED_OPEN}{DEBUG_PREFIX}{TAG_MUTED_CLOSE} {message}")


@contextmanager
def step(message: str) -> Iterator[None]:
    with Progress(
        SpinnerColumn(),
        TextColumn(TAG_PROGRESS_DESCRIPTION),
        console=console,
        transient=True,
    ) as progress:
        progress.add_task(message, total=None)
        yield


def key_value_table(title: str, rows: list[tuple[str, object]]) -> None:
    table = Table(title=title, show_header=True, header_style=STYLE_VALUE_BOLD_CYAN)
    table.add_column(COLUMN_KEY, style=STYLE_MUTED)
    table.add_column(COLUMN_VALUE)

    for key, value in rows:
        table.add_row(str(key), str(value))

    console.print(table)
