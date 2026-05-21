"""CLI application setup."""

import typer

from constants.cli import CLI_APP_HELP, CLI_APP_NAME
from logger import setup_logging

app = typer.Typer(
    name=CLI_APP_NAME,
    help=CLI_APP_HELP,
    add_completion=False,
)


@app.callback()
def main(debug: bool = typer.Option(False, "--debug", help="Enable debug logging.")) -> None:
    setup_logging(debug=debug)


# Register commands - importing them registers them with the app (side-effect imports)
from .commands.docs import docs  # type: ignore
from .commands.generate import generate  # type: ignore
from .commands.inspect import inspect  # type: ignore
from .commands.version import version  # type: ignore
