"""Emit command."""

from __future__ import annotations

from pathlib import Path

import typer


def _split_only(value: str | None) -> tuple[str, ...]:
    if not value:
        return ()
    return tuple(part.strip() for part in value.split(",") if part.strip())


def emit_command(
    ctx: typer.Context,
    spec_path: Path = typer.Argument(Path("codepot.v1.yaml"), help="Path to Codepot spec."),
    language: str = typer.Option("python", "--language", "-l", help="Target language."),
    output_path: Path = typer.Option(Path("generated"), "--out", "-o", help="Output root."),
    templates_path: Path | None = typer.Option(None, "--templates", "-t", help="Templates path."),
    only: str | None = typer.Option(None, "--only", help="Comma-separated group ids."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Do not write files."),
    force: bool = typer.Option(False, "--force", help="Force overwrite."),
    json_output: bool = typer.Option(False, "--json", help="Output machine-readable JSON."),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress normal output."),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show extra details."),
    debug: bool = typer.Option(False, "--debug", help="Raise errors with traceback."),
) -> None:
    """Generate files from a Codepot spec."""

    try:
        from cli.main import get_runtime

        result = get_runtime(ctx).emit(
            spec_path=spec_path,
            language=language,
            output_path=output_path,
            templates_path=templates_path,
            only=_split_only(only),
            dry_run=dry_run,
            force=force,
        )

        if quiet:
            return

        mode = "Dry run" if result.dry_run else "Emitting"
        typer.echo(f"{mode} {result.language} → {result.output_path}")
        typer.echo("")

        for path in result.planned:
            typer.echo(f"  dry-run   {path}")

        for path in result.created:
            typer.echo(f"  created   {path}")

        for path in result.updated:
            typer.echo(f"  updated   {path}")

        for path in result.unchanged:
            typer.echo(f"  unchanged {path}")

        for error in result.errors:
            typer.echo(f"  failed    {error}")

        processed = len(result.planned) + len(result.created) + len(result.updated) + len(result.unchanged)

        typer.echo("")
        typer.echo(f"{processed} files processed")

        if result.errors:
            raise typer.Exit(2)

    except Exception as exc:
        typer.echo(f"Error: {exc}", err=True)
        if debug:
            raise
        raise typer.Exit(1) from exc
