"""Docs handler."""

from logger import console, setup_logging
from openapi.loader import load_openapi
from openapi.validator import validate_openapi_shape

from ..options.models import DocsOptions


def handle_docs(options: DocsOptions) -> None:
    """Generate Markdown API docs from OpenAPI."""
    setup_logging(debug=options.common.debug)

    spec = load_openapi(options.common.input)
    validate_openapi_shape(spec)

    from docs.writer import generate_docs

    generate_docs(
        spec=spec,
        output=options.output,
        clean=options.clean,
        dry_run=options.common.dry_run,
    )

    console.print(f"[bold green]Docs generated:[/bold green] [cyan]{options.output}[/cyan]")
