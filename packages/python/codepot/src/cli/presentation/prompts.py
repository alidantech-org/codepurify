"""Interactive prompt wrappers."""

from __future__ import annotations

from pathlib import Path

import questionary


def ask_spec_path(default: Path) -> Path:
    answer = questionary.path("Spec path", default=str(default)).ask()
    return Path(answer or default)


def ask_language(default: str) -> str:
    answer = questionary.text("Language", default=default).ask()
    return answer or default


def ask_templates_path(default: Path | None) -> Path | None:
    answer = questionary.path("Templates path", default=str(default or "")).ask()
    return Path(answer) if answer else default


def ask_output_path(default: Path) -> Path:
    answer = questionary.path("Output path", default=str(default)).ask()
    return Path(answer or default)


def ask_only_groups() -> tuple[str, ...]:
    answers = questionary.checkbox(
        "Only generate",
        choices=["models", "dtos", "resources", "once"],
    ).ask()
    return tuple(answers or ())


def ask_confirm_emit() -> bool:
    return bool(questionary.confirm("Generate files?", default=True).ask())


def ask_dry_run(default: bool) -> bool:
    return bool(questionary.confirm("Dry run?", default=default).ask())
