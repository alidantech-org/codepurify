"""Inspect command."""

from __future__ import annotations

from pathlib import Path

import typer


def inspect_command(
    ctx: typer.Context,
    spec_path: Path = typer.Argument(Path("codepot.v1.yaml"), help="Path to Codepot spec."),
    schemas: bool = typer.Option(False, "--schemas", help="Inspect schemas."),
    resources: bool = typer.Option(False, "--resources", help="Inspect resources."),
    refs: bool = typer.Option(False, "--refs", help="Inspect refs."),
    content_types: bool = typer.Option(False, "--content-types", help="Inspect content types."),
    json_output: bool = typer.Option(False, "--json", help="Output machine-readable JSON."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress normal output."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show extra details."),
    debug: bool = typer.Option(False, "--debug", help="Raise errors with traceback."),
) -> None:
    """Inspect a Codepot spec."""

    try:
        from cli.main import get_runtime

        what = "overview"
        if schemas:
            what = "schemas"
        elif resources:
            what = "resources"
        elif refs:
            what = "refs"
        elif content_types:
            what = "content_types"

        result = get_runtime(ctx).inspect(spec_path=spec_path, what=what)

        if quiet:
            return

        typer.echo(f"Inspect  {result.spec_path}")
        typer.echo("")

        for key, value in result.summary.items():
            typer.echo(f"{key:16} {value}")

    except Exception as exc:
        typer.echo(f"Error: {exc}", err=True)
        if debug:
            raise
        raise typer.Exit(1) from exc
