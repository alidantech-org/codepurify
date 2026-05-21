"""Inspect command."""

from pathlib import Path

import typer

from constants.cli import (
    CLI_OPTION_DEBUG,
    CLI_OPTION_DART_OUTPUT,
    CLI_OPTION_DOCS_OUTPUT,
    CLI_OPTION_DRY_RUN,
    CLI_OPTION_INPUT,
    CLI_OPTION_PACKAGE_NAME,
    CLI_HELP_DEBUG,
    CLI_HELP_DART_OUTPUT,
    CLI_HELP_DOCS_OUTPUT,
    CLI_HELP_DRY_RUN,
    CLI_HELP_INPUT,
    CLI_HELP_PACKAGE_NAME,
)
from constants.paths import (
    DEFAULT_DART_OUTPUT,
    DEFAULT_DOCS_OUTPUT,
    DEFAULT_OPENAPI_INPUT,
    DEFAULT_DART_PACKAGE_NAME,
)

from ..app import app
from ..options.models import CommonOptions, InspectOptions, OutputOptions


@app.command("inspect")
def inspect(
    input: Path = typer.Option(DEFAULT_OPENAPI_INPUT, CLI_OPTION_INPUT, help=CLI_HELP_INPUT),
    dart_output: Path = typer.Option(DEFAULT_DART_OUTPUT, CLI_OPTION_DART_OUTPUT, help=CLI_HELP_DART_OUTPUT),
    docs_output: Path = typer.Option(DEFAULT_DOCS_OUTPUT, CLI_OPTION_DOCS_OUTPUT, help=CLI_HELP_DOCS_OUTPUT),
    package_name: str = typer.Option(DEFAULT_DART_PACKAGE_NAME, CLI_OPTION_PACKAGE_NAME, help=CLI_HELP_PACKAGE_NAME),
    dry_run: bool = typer.Option(False, CLI_OPTION_DRY_RUN, help=CLI_HELP_DRY_RUN),
    debug: bool = typer.Option(False, CLI_OPTION_DEBUG, help=CLI_HELP_DEBUG),
) -> None:
    """Load and inspect an OpenAPI file."""
    from ..handlers.inspect import handle_inspect

    common = CommonOptions(input=input, dry_run=dry_run, debug=debug)
    output = OutputOptions(dart_output=dart_output, docs_output=docs_output, package_name=package_name)
    options = InspectOptions(common=common, output=output)

    handle_inspect(options)
