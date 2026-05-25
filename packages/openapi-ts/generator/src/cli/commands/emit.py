from __future__ import annotations

from pathlib import Path

import typer

from core.config import CliOptions, create_runtime_context
from core.logging import error, print_header
from runtime.app import GeneratorApp


def emit_command(
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
    language: str = typer.Option(
        ...,
        "--language",
        "-l",
        help="Target language plugin, for example: debug, dart, typescript.",
    ),
    output: Path = typer.Option(
        ...,
        "--output",
        "-o",
        help="Output directory for generated files.",
    ),
    dry_run: bool = typer.Option(False, "--dry-run", help="Plan emission without writing files."),
    debug: bool = typer.Option(False, "--debug", help="Show debug logs."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show verbose logs."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Reduce terminal output."),
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

        print_header("Emit Code", f"{language} → {resolved_output}")
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
