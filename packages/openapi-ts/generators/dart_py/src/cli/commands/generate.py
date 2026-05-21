"""Generate command."""

from pathlib import Path

import typer

from constants.cli import (
    CLI_OPTION_CLEAN,
    CLI_OPTION_DEBUG,
    CLI_OPTION_DART_OUTPUT,
    CLI_OPTION_DOCS_OUTPUT,
    CLI_OPTION_DRY_RUN,
    CLI_OPTION_FORCE_TOOLING,
    CLI_OPTION_FORMAT,
    CLI_OPTION_INPUT,
    CLI_OPTION_INTERACTIVE,
    CLI_OPTION_INTERACTIVE_SHORT,
    CLI_OPTION_PACKAGE_NAME,
    CLI_OPTION_STRICT_FORMAT,
    CLI_OPTION_TOOLING,
    CLI_OPTION_YES,
    CLI_OPTION_YES_SHORT,
    CLI_HELP_CLEAN,
    CLI_HELP_DEBUG,
    CLI_HELP_DART_OUTPUT,
    CLI_HELP_DOCS_OUTPUT,
    CLI_HELP_DRY_RUN,
    CLI_HELP_FORCE_TOOLING,
    CLI_HELP_FORMAT,
    CLI_HELP_INPUT,
    CLI_HELP_INTERACTIVE,
    CLI_HELP_PACKAGE_NAME,
    CLI_HELP_STRICT_FORMAT,
    CLI_HELP_TOOLING,
    CLI_HELP_YES,
)
from constants.paths import (
    DEFAULT_DART_OUTPUT,
    DEFAULT_DOCS_OUTPUT,
    DEFAULT_OPENAPI_INPUT,
    DEFAULT_DART_PACKAGE_NAME,
)

from ..app import app
from ..options.mode import resolve_generation_mode


@app.command("generate")
def generate(
    input: Path = typer.Option(DEFAULT_OPENAPI_INPUT, CLI_OPTION_INPUT, help=CLI_HELP_INPUT),
    dart_output: Path = typer.Option(DEFAULT_DART_OUTPUT, CLI_OPTION_DART_OUTPUT, help=CLI_HELP_DART_OUTPUT),
    docs_output: Path = typer.Option(DEFAULT_DOCS_OUTPUT, CLI_OPTION_DOCS_OUTPUT, help=CLI_HELP_DOCS_OUTPUT),
    package_name: str = typer.Option(DEFAULT_DART_PACKAGE_NAME, CLI_OPTION_PACKAGE_NAME, help=CLI_HELP_PACKAGE_NAME),
    no_docs: bool = typer.Option(False, "--no-docs", help="Skip Markdown docs generation."),
    no_dart: bool = typer.Option(False, "--no-dart", help="Skip Dart SDK generation."),
    only_docs: bool = typer.Option(False, "--only-docs", help="Generate only Markdown docs."),
    only_dart: bool = typer.Option(False, "--only-dart", help="Generate only Dart SDK files."),
    only_enums: bool = typer.Option(False, "--only-enums", help="Generate only enum files (for development/testing)."),
    only_fields: bool = typer.Option(False, "--only-fields", help="Generate only field constant files (for development/testing)."),
    only_classes: bool = typer.Option(False, "--only-classes", help="Generate only model/DTO class files (for development/testing)."),
    clean: bool = typer.Option(False, CLI_OPTION_CLEAN, help=CLI_HELP_CLEAN),
    format: bool = typer.Option(False, CLI_OPTION_FORMAT, help=CLI_HELP_FORMAT),
    strict_format: bool = typer.Option(False, CLI_OPTION_STRICT_FORMAT, help=CLI_HELP_STRICT_FORMAT),
    tooling: bool = typer.Option(False, CLI_OPTION_TOOLING, help=CLI_HELP_TOOLING),
    force_tooling: bool = typer.Option(False, CLI_OPTION_FORCE_TOOLING, help=CLI_HELP_FORCE_TOOLING),
    dry_run: bool = typer.Option(False, CLI_OPTION_DRY_RUN, help=CLI_HELP_DRY_RUN),
    interactive: bool = typer.Option(False, CLI_OPTION_INTERACTIVE, CLI_OPTION_INTERACTIVE_SHORT, help=CLI_HELP_INTERACTIVE),
    yes: bool = typer.Option(False, CLI_OPTION_YES, CLI_OPTION_YES_SHORT, help=CLI_HELP_YES),
    debug: bool = typer.Option(False, CLI_OPTION_DEBUG, help=CLI_HELP_DEBUG),
) -> None:
    """Generate SDK outputs. By default, runs interactive wizard."""
    from ..handlers.generate import handle_generate

    selection = resolve_generation_mode(
        yes=yes,
        interactive=interactive,
        no_docs=no_docs,
        no_dart=no_dart,
        only_docs=only_docs,
        only_dart=only_dart,
        only_enums=only_enums,
        only_fields=only_fields,
        only_classes=only_classes,
        clean=clean,
        format=format,
        tooling=tooling,
    )

    handle_generate(
        input=input,
        dart_output=dart_output,
        docs_output=docs_output,
        package_name=package_name,
        selection=selection,
        strict_format=strict_format,
        force_tooling=force_tooling,
        dry_run=dry_run,
        debug=debug,
    )
