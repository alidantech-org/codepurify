"""Infer command renderer."""

from __future__ import annotations

import json

from app import InferResult
from cli.presentation.console import console


def render_infer_result(result: InferResult) -> None:
    if result.show_paths:
        for file in result.files:
            console.print(file.path.as_posix())
        return

    console.print(f"[bold]Inferred {len(result.files)} files ({result.language})[/bold]")
    console.print()

    for file in result.files:
        console.print(
            f"  [cyan]{file.path.as_posix():28}[/cyan] "
            f"{file.template:18} {file.group}: {file.source}",
        )
        if result.show_context:
            context = json.dumps(file.context, sort_keys=True)
            console.print(f"    context: {context}")

    console.print()
    console.print("No files written. Run emit to generate.")
