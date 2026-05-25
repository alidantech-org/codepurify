from __future__ import annotations

from pathlib import Path

import typer

from core.config import CliOptions, create_runtime_context
from core.logging import error, print_header
from runtime.app import GeneratorApp


def validate_command(
    input_file: Path = typer.Option(
        ...,
        "--input",
        "-i",
        help="Path to the OpenAPI YAML or JSON file.",
        exists=False,
        file_okay=True,
        dir_okay=False,
        readable=True,
    ),
    debug: bool = typer.Option(False, "--debug", help="Show debug logs."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show verbose logs."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Reduce terminal output."),
) -> None:
    try:
        options = CliOptions(debug=debug, verbose=verbose, quiet=quiet)
        context = create_runtime_context(options)
        app = GeneratorApp(context)

        resolved_input = context.paths.resolve_input(input_file)

        print_header("Validate OpenAPI", str(resolved_input))
        app.validate(resolved_input)

    except Exception as exc:
        error(str(exc))
        if debug:
            raise
        raise typer.Exit(1) from exc
