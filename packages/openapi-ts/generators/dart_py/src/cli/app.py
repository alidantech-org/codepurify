"""CLI application setup."""

import typer

from cli.commands.docs import docs
from cli.commands.generate import generate
from cli.commands.inspect import inspect
from cli.commands.version import version
from constants.cli import CLI_APP_HELP, CLI_APP_NAME
from logger import setup_logging

app = typer.Typer(
    name=CLI_APP_NAME,
    help=CLI_APP_HELP,
    add_completion=False,
)

app.command()(generate)
app.command()(docs)
app.command()(inspect)
app.command()(version)


@app.callback()
def main(debug: bool = typer.Option(False, "--debug", help="Enable debug logging.")) -> None:
    setup_logging(debug=debug)


def cli() -> None:
    """Entry point for the CLI."""
    app()


if __name__ == "__main__":
    cli()
