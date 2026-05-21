"""Generate handler."""

from pathlib import Path

from config import GeneratorConfig
from logger import console, get_logger, setup_logging
from openapi.loader import load_openapi
from openapi.validator import validate_openapi_shape

from ..options.mode import GenerationSelection

log = get_logger(__name__)


def handle_generate(
    input: Path,
    dart_output: Path,
    docs_output: Path,
    package_name: str,
    selection: GenerationSelection,
    strict_format: bool,
    force_tooling: bool,
    dry_run: bool,
    debug: bool,
) -> None:
    """Generate SDK outputs."""
    setup_logging(debug=debug)

    if selection.interactive:
        from ..interactive.generate_wizard import run_wizard

        selection = run_wizard(
            selection.clean,
            selection.tooling,
            selection.format,
        )

    config = build_generator_config(
        input=input,
        dart_output=dart_output,
        docs_output=docs_output,
        package_name=package_name,
        selection=selection,
        strict_format=strict_format,
        force_tooling=force_tooling,
        dry_run=dry_run,
        debug=debug,
    )

    spec = load_openapi(config.input)
    validate_openapi_shape(spec)

    console.print("[bold green]OpenAPI loaded successfully[/bold green]")

    generate_docs_if_enabled(spec, config)
    generate_dart_if_enabled(spec, config)

    console.print("[bold green]Generation complete[/bold green]")


def build_generator_config(
    input: Path,
    dart_output: Path,
    docs_output: Path,
    package_name: str,
    selection: GenerationSelection,
    strict_format: bool,
    force_tooling: bool,
    dry_run: bool,
    debug: bool,
) -> GeneratorConfig:
    """Build generator config from CLI inputs."""
    return GeneratorConfig(
        input=input,
        dart_output=dart_output,
        docs_output=docs_output,
        package_name=package_name,
        generate_docs=selection.generate_docs,
        generate_dart=selection.generate_dart,
        generate_enums_only=(selection.generate_enums and not selection.generate_fields and not selection.generate_classes),
        generate_fields_only=(selection.generate_fields and not selection.generate_enums and not selection.generate_classes),
        generate_classes_only=(selection.generate_classes and not selection.generate_fields and not selection.generate_enums),
        format=selection.format,
        strict_format=strict_format,
        tooling=selection.tooling,
        force_tooling=force_tooling,
        clean=selection.clean,
        dry_run=dry_run,
        debug=debug,
        interactive=selection.interactive,
    )


def generate_docs_if_enabled(
    spec: dict,
    config: GeneratorConfig,
) -> None:
    """Generate docs when enabled."""
    if not config.generate_docs:
        console.print("[yellow]Docs skipped[/yellow]")
        return

    from docs.writer import generate_docs

    generate_docs(
        spec=spec,
        output=config.docs_output,
        clean=config.clean,
        dry_run=config.dry_run,
    )

    console.print(f"[green]Docs generated:[/green] [cyan]{config.docs_output}[/cyan]")


def generate_dart_if_enabled(
    spec: dict,
    config: GeneratorConfig,
) -> None:
    """Generate Dart SDK when enabled."""
    if not config.generate_dart:
        console.print("[yellow]Dart generation skipped[/yellow]")
        return

    from dart.api import generate_dart_sdk

    generate_dart_sdk(spec, config)
