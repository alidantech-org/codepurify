"""Interactive CLI prompts."""

from __future__ import annotations

from pathlib import Path

import questionary


def ask_input_path() -> Path:
    """Ask for the input OpenAPI path."""
    value = questionary.path("OpenAPI input file:").ask()
    if not value:
        raise ValueError("input path is required")
    return Path(value)


def ask_language() -> str:
    """Ask for target language."""
    value = questionary.select(
        "Target language:",
        choices=["debug", "dart", "typescript"],
    ).ask()
    if not value:
        raise ValueError("language is required")
    return str(value)


def ask_output_path() -> Path:
    """Ask for output path."""
    value = questionary.path("Output path:").ask()
    if not value:
        raise ValueError("output path is required")
    return Path(value)
