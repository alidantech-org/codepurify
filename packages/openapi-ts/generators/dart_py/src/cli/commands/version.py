"""Version command."""

import typer

from constants.cli import CLI_OPTION_DEBUG, CLI_HELP_DEBUG

from ..app import app


@app.command("version")
def version(
    debug: bool = typer.Option(False, CLI_OPTION_DEBUG, help=CLI_HELP_DEBUG),
) -> None:
    """Print generator version."""
    from ..handlers.version import handle_version

    handle_version()
