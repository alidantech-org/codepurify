"""Interactive CLI prompts."""

from __future__ import annotations

from pathlib import Path

import questionary

from cli.constants.defaults import (
    DEFAULT_LANGUAGE,
    DEFAULT_OUTPUT_PATH,
    DEFAULT_SPEC_PATH,
    DEFAULT_TEMPLATES_ROOT,
)


def ask_spec_path(default: Path = DEFAULT_SPEC_PATH) -> Path:
    """Ask for the spec path."""

    value = questionary.path("Spec path:", default=str(default)).ask()
    return Path(value or default)


def ask_language(default: str = DEFAULT_LANGUAGE) -> str:
    """Ask for target language."""

    value = questionary.text("Target language:", default=default).ask()
    return value or default


def ask_templates_path(language: str, default_root: Path = DEFAULT_TEMPLATES_ROOT) -> Path:
    """Ask for templates directory."""

    default = default_root / language
    value = questionary.path("Templates directory:", default=str(default)).ask()
    return Path(value or default)


def ask_output_path(default: Path = DEFAULT_OUTPUT_PATH) -> Path:
    """Ask for output root."""

    value = questionary.path("Output root:", default=str(default)).ask()
    return Path(value or default)


def ask_only_groups() -> tuple[str, ...]:
    """Ask for optional group IDs."""

    value = questionary.text("Only groups, comma-separated:", default="").ask()
    if not value:
        return ()

    return tuple(part.strip() for part in value.split(",") if part.strip())


def ask_dry_run(default: bool = False) -> bool:
    """Ask whether this should be a dry run."""

    value = questionary.confirm("Dry run?", default=default).ask()
    return bool(value)


def ask_force(default: bool = False) -> bool:
    """Ask whether files should be overwritten."""

    value = questionary.confirm("Force overwrite?", default=default).ask()
    return bool(value)


def ask_strict(default: bool = False) -> bool:
    """Ask whether strict validation should be enabled."""

    value = questionary.confirm("Strict validation?", default=default).ask()
    return bool(value)
