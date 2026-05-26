"""Command for visualizing template-driven output plans."""

from __future__ import annotations

from pathlib import Path

import typer

from constants.cli import (
    HEADER_EMIT_PLAN,
    HELP_DEBUG,
    HELP_INPUT,
    HELP_LANGUAGE,
    HELP_TEMPLATES,
    HELP_VERBOSE,
    HELP_QUIET,
    OPT_DEBUG,
    OPT_INPUT,
    OPT_LANGUAGE,
    OPT_TEMPLATES,
    OPT_VERBOSE,
    OPT_QUIET,
)
from core.config import CliOptions, create_runtime_context
from core.logging import error, print_header
from runtime.app import GeneratorApp


def emit_plan_command(
    input_file: Path | None = typer.Option(
        None,
        f"--{OPT_INPUT}",
        "-i",
        help=HELP_INPUT,
        exists=False,
        file_okay=True,
        dir_okay=False,
        readable=True,
    ),
    language: str = typer.Option(
        ...,
        f"--{OPT_LANGUAGE}",
        "-l",
        help=HELP_LANGUAGE,
    ),
    templates: Path | None = typer.Option(
        None,
        f"--{OPT_TEMPLATES}",
        help=HELP_TEMPLATES,
    ),
    debug: bool = typer.Option(False, f"--{OPT_DEBUG}", help=HELP_DEBUG),
    verbose: bool = typer.Option(False, f"--{OPT_VERBOSE}", "-v", help=HELP_VERBOSE),
    quiet: bool = typer.Option(False, f"--{OPT_QUIET}", "-q", help=HELP_QUIET),
) -> None:
    try:
        options = CliOptions(
            debug=debug,
            verbose=verbose,
            quiet=quiet,
            dry_run=True,
        )
        context = create_runtime_context(options)
        app = GeneratorApp(context)

        resolved_input = context.paths.resolve_input(input_file) if input_file else None
        resolved_templates = context.paths.resolve_input(templates) if templates else None

        print_header(HEADER_EMIT_PLAN, language)
        plan = app.emit_plan(
            input_path=resolved_input,
            language=language,
            templates_path=resolved_templates,
        )
        print(plan)

    except Exception as exc:
        error(str(exc))
        if debug:
            raise
        raise typer.Exit(1) from exc
