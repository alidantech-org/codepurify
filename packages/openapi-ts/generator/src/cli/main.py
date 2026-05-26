from __future__ import annotations

import typer

from cli.commands.emit import emit_command
from cli.commands.emit_plan import emit_plan_command
from cli.commands.infer import infer_command
from cli.commands.inspect import inspect_command
from cli.commands.validate import validate_command
from constants.cli import (
    APP_DESCRIPTION,
    APP_NAME,
    APP_VERSION,
    CMD_EMIT,
    CMD_EMIT_PLAN,
    CMD_INFER,
    CMD_INSPECT,
    CMD_VALIDATE,
    HELP_EMIT,
    HELP_EMIT_PLAN,
    HELP_INFER,
    HELP_INSPECT,
    HELP_VALIDATE,
    HELP_VERSION,
    OPT_VERSION,
)
from core.logging import print_header

app = typer.Typer(
    name=APP_NAME,
    help=APP_DESCRIPTION,
    add_completion=False,
    no_args_is_help=True,
    rich_markup_mode="rich",
)


@app.callback()
def main(
    version: bool = typer.Option(
        False,
        f"--{OPT_VERSION}",
        help=HELP_VERSION,
    ),
) -> None:
    if version:
        print_header(APP_NAME, APP_VERSION)
        raise typer.Exit()


app.command(CMD_INSPECT, help=HELP_INSPECT)(inspect_command)
app.command(CMD_INFER, help=HELP_INFER)(infer_command)
app.command(CMD_EMIT, help=HELP_EMIT)(emit_command)
app.command(CMD_VALIDATE, help=HELP_VALIDATE)(validate_command)
app.command(CMD_EMIT_PLAN, help=HELP_EMIT_PLAN)(emit_plan_command)


if __name__ == "__main__":
    app()
