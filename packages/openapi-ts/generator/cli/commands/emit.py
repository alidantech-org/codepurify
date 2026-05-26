from __future__ import annotations

from pathlib import Path

import typer

from cli.constants import (
    HELP_DEBUG,
    HELP_DRY_RUN,
    HELP_INPUT,
    HELP_INTERACTIVE,
    HELP_LANGUAGE,
    HELP_OUTPUT,
    HELP_QUIET,
    HELP_TEMPLATES,
    HELP_VERBOSE,
    OPT_DEBUG,
    OPT_DRY_RUN,
    OPT_INPUT,
    OPT_INTERACTIVE,
    OPT_LANGUAGE,
    OPT_OUTPUT,
    OPT_QUIET,
    OPT_TEMPLATES,
    OPT_VERBOSE,
)
from cli.interactive import ask_input_path, ask_language, ask_output_path
from cli.presentation.console import print_error, print_header
from cli.presentation.emit import render_emit_result
from runtime.app import GeneratorApp


def emit_command(
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
    language: str | None = typer.Option(
        None,
        f"--{OPT_LANGUAGE}",
        "-l",
        help=HELP_LANGUAGE,
    ),
    output: Path | None = typer.Option(
        None,
        f"--{OPT_OUTPUT}",
        "-o",
        help=HELP_OUTPUT,
    ),
    templates: Path | None = typer.Option(
        None,
        f"--{OPT_TEMPLATES}",
        help=HELP_TEMPLATES,
    ),
    dry_run: bool = typer.Option(False, f"--{OPT_DRY_RUN}", help=HELP_DRY_RUN),
    interactive: bool = typer.Option(
        False,
        f"--{OPT_INTERACTIVE}",
        "-I",
        help=HELP_INTERACTIVE,
    ),
    debug: bool = typer.Option(False, f"--{OPT_DEBUG}", help=HELP_DEBUG),
    verbose: bool = typer.Option(False, f"--{OPT_VERBOSE}", "-v", help=HELP_VERBOSE),
    quiet: bool = typer.Option(False, f"--{OPT_QUIET}", "-q", help=HELP_QUIET),
) -> None:
    """Emit output for a target language."""
    try:
        resolved_input = input_file
        resolved_language = language
        resolved_output = output

        if interactive:
            resolved_input = resolved_input or ask_input_path()
            resolved_language = resolved_language or ask_language()
            resolved_output = resolved_output or ask_output_path()

        if resolved_input is None:
            raise ValueError("missing required option: --input")
        if resolved_language is None:
            raise ValueError("missing required option: --language")
        if resolved_output is None:
            raise ValueError("missing required option: --output")

        if not quiet:
            print_header("Emit", f"{resolved_language} → {resolved_output}")

        app = GeneratorApp()
        result = app.emit(
            input_path=resolved_input,
            language=resolved_language,
            output_path=resolved_output,
            dry_run=dry_run,
            templates_path=templates,
        )

        if not quiet:
            render_emit_result(result, verbose=verbose)

    except Exception as exc:
        print_error(str(exc))
        if debug:
            raise
        raise typer.Exit(1) from exc
