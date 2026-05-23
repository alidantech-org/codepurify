"""Inspect handler."""

from config import GeneratorConfig
from logger import setup_logging
from openapi.loader import load_openapi
from openapi.validator import validate_openapi_shape

from cli.options.models import InspectOptions


def handle_inspect(options: InspectOptions) -> None:
    """Load and inspect an OpenAPI file."""
    setup_logging(debug=options.common.debug)

    config = GeneratorConfig(
        input=options.common.input,
        dart_output=options.output.dart_output,
        docs_output=options.output.docs_output,
        package_name=options.output.package_name,
        debug=options.common.debug,
        dry_run=options.common.dry_run,
    )

    spec = load_openapi(config.input)
    validate_openapi_shape(spec)

    from dart.inspection import build_dart_inspection, print_dart_inspection

    inspection = build_dart_inspection(spec, config)
    print_dart_inspection(inspection)
