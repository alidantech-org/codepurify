from __future__ import annotations

from pathlib import Path

import typer

from constants.cli import (
    HEADER_EMIT,
    HELP_DEBUG,
    HELP_DRY_RUN,
    HELP_INPUT,
    HELP_LANGUAGE,
    HELP_OUTPUT,
    HELP_QUIET,
    HELP_VERBOSE,
    OPT_DEBUG,
    OPT_DRY_RUN,
    OPT_INPUT,
    OPT_LANGUAGE,
    OPT_OUTPUT,
    OPT_QUIET,
    OPT_VERBOSE,
)
from core.config import CliOptions, create_runtime_context
from core.logging import error, print_header
from runtime.app import GeneratorApp


def emit_command(
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
    language: str = typer.Option(
        ...,
        f"--{OPT_LANGUAGE}",
        "-l",
        help=HELP_LANGUAGE,
    ),
    output: Path = typer.Option(
        ...,
        f"--{OPT_OUTPUT}",
        "-o",
        help=HELP_OUTPUT,
    ),
    dry_run: bool = typer.Option(False, f"--{OPT_DRY_RUN}", help=HELP_DRY_RUN),
    debug: bool = typer.Option(False, f"--{OPT_DEBUG}", help=HELP_DEBUG),
    verbose: bool = typer.Option(False, f"--{OPT_VERBOSE}", "-v", help=HELP_VERBOSE),
    quiet: bool = typer.Option(False, f"--{OPT_QUIET}", "-q", help=HELP_QUIET),
) -> None:
    try:
        options = CliOptions(
            debug=debug,
            verbose=verbose,
            quiet=quiet,
            dry_run=dry_run,
        )
        context = create_runtime_context(options)
        app = GeneratorApp(context)

        resolved_input = context.paths.resolve_input(input_file)
        resolved_output = context.paths.resolve_output(output)

        print_header(HEADER_EMIT, f"{language} → {resolved_output}")
        app.emit(
            input_path=resolved_input,
            language=language,
            output_path=resolved_output,
        )

    except Exception as exc:
        error(str(exc))
        if debug:
            raise
        raise typer.Exit(1) from exc
