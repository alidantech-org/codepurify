"""
Dart inspection builder.

This module builds inspection data for Dart SDK planning.
It does not print Rich tables directly.
"""

from config import GeneratorConfig
from openapi.inspector import (
    collect_operations,
    collect_tags,
    count_paths,
    count_schemas,
)
from dart.planning.operation_plans import build_operation_plans
from dart.planning.plan_registry import build_dart_plans

from .models import DartInspection


def build_dart_inspection(
    spec: dict,
    config: GeneratorConfig,
) -> DartInspection:
    """Build Dart inspection data from OpenAPI spec and generator config."""
    operations = collect_operations(spec)
    tags = collect_tags(spec)
    plans = build_dart_plans(spec, config.package_name)
    operation_plans = build_operation_plans(spec)

    return DartInspection(
        spec=spec,
        input_path=str(config.input),
        dart_output=str(config.dart_output),
        docs_output=str(config.docs_output),
        package_name=config.package_name,
        openapi_version=spec.get("openapi"),
        paths_count=count_paths(spec),
        schemas_count=count_schemas(spec),
        operations=operations,
        tags=tags,
        plans=plans,
        operation_plans=operation_plans,
        debug=config.debug,
    )
