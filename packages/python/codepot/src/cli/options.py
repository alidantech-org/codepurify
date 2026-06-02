"""Shared CLI option and value resolution helpers."""

from __future__ import annotations

from pathlib import Path

import typer

from cli.constants import options as opt
from cli.constants.defaults import DEFAULT_LANGUAGE, DEFAULT_OUTPUT_PATH, DEFAULT_SPEC_PATH
from cli.presentation.prompts import (
    ask_dry_run,
    ask_force,
    ask_language,
    ask_only_groups,
    ask_output_path,
    ask_spec_path,
    ask_strict,
    ask_templates_path,
)


def spec_argument():
    return typer.Argument(help=opt.HELP_SPEC)


def language_option():
    return typer.Option("--language", "-l", help=opt.HELP_LANGUAGE)


def templates_option():
    return typer.Option("--templates", "-t", help=opt.HELP_TEMPLATES)


def output_option():
    return typer.Option("--out", "-o", help=opt.HELP_OUT)


def only_option():
    return typer.Option("--only", help=opt.HELP_ONLY)


def json_option():
    return typer.Option("--json", help=opt.HELP_JSON)


def quiet_option():
    return typer.Option("--quiet", "-q", help=opt.HELP_QUIET)


def verbose_option():
    return typer.Option("--verbose", "-v", help=opt.HELP_VERBOSE)


def debug_option():
    return typer.Option("--debug", help=opt.HELP_DEBUG)


def interactive_option():
    return typer.Option("--interactive", "-I", help=opt.HELP_INTERACTIVE)


def parse_only(value: str | None) -> tuple[str, ...]:
    """Parse comma-separated group IDs."""

    if not value:
        return ()
    return tuple(part.strip() for part in value.split(",") if part.strip())


def resolve_spec_path(value: Path | None, *, interactive: bool) -> Path:
    """Resolve spec path from CLI or prompt/default."""

    if interactive:
        return ask_spec_path(value or DEFAULT_SPEC_PATH)

    return value or DEFAULT_SPEC_PATH


def resolve_language(value: str | None, *, interactive: bool) -> str:
    """Resolve target language."""

    if interactive:
        return ask_language(value or DEFAULT_LANGUAGE)

    return value or DEFAULT_LANGUAGE


def resolve_output_path(value: Path | None, *, interactive: bool) -> Path:
    """Resolve output path."""

    if interactive:
        return ask_output_path(value or DEFAULT_OUTPUT_PATH)

    return value or DEFAULT_OUTPUT_PATH


def resolve_templates_path(
    value: Path | None,
    *,
    language: str,
    interactive: bool,
) -> Path | None:
    """Resolve templates path."""

    if interactive:
        return ask_templates_path(language)

    return value


def resolve_only(value: str | None, *, interactive: bool) -> tuple[str, ...]:
    """Resolve group filter."""

    if interactive:
        prompted = ask_only_groups()
        if prompted:
            return prompted

    return parse_only(value)


def resolve_strict(value: bool, *, interactive: bool) -> bool:
    """Resolve strict validation flag."""

    if interactive:
        return ask_strict(value)

    return value


def resolve_dry_run(value: bool, *, interactive: bool) -> bool:
    """Resolve dry-run flag."""

    if interactive:
        return ask_dry_run(value)

    return value


def resolve_force(value: bool, *, interactive: bool) -> bool:
    """Resolve force flag."""

    if interactive:
        return ask_force(value)

    return value
