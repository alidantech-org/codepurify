"""Docs command."""

from pathlib import Path

import typer

from constants.cli import (
    CLI_OPTION_CLEAN,
    CLI_OPTION_DEBUG,
    CLI_OPTION_DRY_RUN,
    CLI_OPTION_INPUT,
    CLI_OPTION_OUTPUT,
    CLI_OPTION_OUTPUT_SHORT,
    CLI_HELP_CLEAN,
    CLI_HELP_DEBUG,
    CLI_HELP_DRY_RUN,
    CLI_HELP_INPUT,
)
from constants.paths import DEFAULT_DOCS_OUTPUT, DEFAULT_OPENAPI_INPUT

from cli.options.models import CommonOptions, DocsOptions


def docs(
    input: Path = typer.Option(DEFAULT_OPENAPI_INPUT, CLI_OPTION_INPUT, help=CLI_HELP_INPUT),
    output: Path = typer.Option(DEFAULT_DOCS_OUTPUT, CLI_OPTION_OUTPUT, CLI_OPTION_OUTPUT_SHORT, help="Docs output dir."),
    clean: bool = typer.Option(False, CLI_OPTION_CLEAN, help=CLI_HELP_CLEAN),
    dry_run: bool = typer.Option(False, CLI_OPTION_DRY_RUN, help=CLI_HELP_DRY_RUN),
    debug: bool = typer.Option(False, CLI_OPTION_DEBUG, help=CLI_HELP_DEBUG),
) -> None:
    """Generate Markdown API docs from OpenAPI (shortcut for generate --only-docs)."""
    from cli.handlers.docs import handle_docs

    common = CommonOptions(input=input, dry_run=dry_run, debug=debug)
    options = DocsOptions(common=common, output=output, clean=clean)

    handle_docs(options)
