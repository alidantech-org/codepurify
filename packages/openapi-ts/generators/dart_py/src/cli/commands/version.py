"""Version command."""

import typer

from constants.cli import CLI_OPTION_DEBUG, CLI_HELP_DEBUG


def version(
    debug: bool = typer.Option(False, CLI_OPTION_DEBUG, help=CLI_HELP_DEBUG),
) -> None:
    """Print generator version."""
    from cli.handlers.version import handle_version

    handle_version()
