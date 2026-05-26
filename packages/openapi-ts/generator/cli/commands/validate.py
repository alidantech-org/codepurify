from __future__ import annotations

from pathlib import Path

import typer

from constants.cli import (
    HEADER_VALIDATE,
    HELP_DEBUG,
    HELP_INPUT,
    HELP_QUIET,
    HELP_VERBOSE,
    OPT_DEBUG,
    OPT_INPUT,
    OPT_QUIET,
    OPT_VERBOSE,
)
from core.config import CliOptions, create_runtime_context
from core.logging import error, print_header
from runtime.app import GeneratorApp


def validate_command(
    input_file: Path = typer.Option(
        ...,
        f"--{OPT_INPUT}",
        "-i",
        help=HELP_INPUT,
        exists=False,
        file_okay=True,
        dir_okay=False,
        readable=True,
    ),
    debug: bool = typer.Option(False, f"--{OPT_DEBUG}", help=HELP_DEBUG),
    verbose: bool = typer.Option(False, f"--{OPT_VERBOSE}", "-v", help=HELP_VERBOSE),
    quiet: bool = typer.Option(False, f"--{OPT_QUIET}", "-q", help=HELP_QUIET),
) -> None:
    try:
        options = CliOptions(debug=debug, verbose=verbose, quiet=quiet)
        context = create_runtime_context(options)
        app = GeneratorApp(context)

        resolved_input = context.paths.resolve_input(input_file)

        print_header(HEADER_VALIDATE, str(resolved_input))
        app.validate(resolved_input)

    except Exception as exc:
        error(str(exc))
        if debug:
            raise
        raise typer.Exit(1) from exc
