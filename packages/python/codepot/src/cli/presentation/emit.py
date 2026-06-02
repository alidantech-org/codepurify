"""Emit command renderer."""

from __future__ import annotations

from collections import Counter

from app import EmitResult
from cli.presentation.console import console


def render_emit_result(result: EmitResult) -> None:
    mode = "Dry run" if result.dry_run else "Emitting"
    console.print(f"[bold]{mode} {result.language} -> {result.output_path}[/bold]")
    console.print()

    for file in result.files:
        console.print(f"  {file.status:<9} {file.path.as_posix()}")

    counts = Counter(file.status for file in result.files)
    console.print()
    if result.dry_run:
        console.print(f"{len(result.files)} files processed")
        return

    console.print(
        f"{len(result.files)} files processed - "
        f"{counts['created']} created - "
        f"{counts['updated']} updated - "
        f"{counts['unchanged']} unchanged",
    )
