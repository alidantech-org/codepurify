"""Codepot CLI entrypoint."""

from __future__ import annotations

import typer

from app import GeneratorApp
from cli.commands.emit import emit_command
from cli.commands.infer import infer_command
from cli.commands.inspect import inspect_command
from cli.commands.validate import validate_command
from cli.constants.app import APP_DESCRIPTION, APP_NAME, APP_VERSION
from cli.constants.commands import CMD_EMIT, CMD_INFER, CMD_INSPECT, CMD_VALIDATE, CMD_VERSION
from cli.state import set_runtime

app = typer.Typer(
    name=APP_NAME,
    help=APP_DESCRIPTION,
    add_completion=False,
    no_args_is_help=True,
)


@app.callback()
def main(ctx: typer.Context) -> None:
    """Initialize CLI runtime state."""

    set_runtime(ctx, GeneratorApp())


@app.command(CMD_VERSION, help="Show version and exit.")
def version_command() -> None:
    """Show CLI version."""

    typer.echo(f"{APP_NAME} {APP_VERSION}")


app.command(CMD_VALIDATE, help="Validate a Codepot spec.")(validate_command)
app.command(CMD_INSPECT, help="Inspect a Codepot spec.")(inspect_command)
app.command(CMD_INFER, help="Show what would be generated.")(infer_command)
app.command(CMD_EMIT, help="Generate files.")(emit_command)


if __name__ == "__main__":
    app()
