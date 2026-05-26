"""CLI terminal logging helpers.

This module may use terminal-focused formatting. Runtime code should return
structured results instead of calling these helpers.
"""

from __future__ import annotations


def print_header(title: str, detail: str | None = None) -> None:
    """Print a simple CLI header."""
    if detail:
        print(f"{title}: {detail}")
        return

    print(title)


def print_error(message: str) -> None:
    """Print a CLI error message."""
    print(f"Error: {message}")
