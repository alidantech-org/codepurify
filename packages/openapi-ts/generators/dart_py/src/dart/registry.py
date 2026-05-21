"""
OpenAPI schema registry and symbol lookup.

This module provides lookup services for OpenAPI components (schemas, parameters,
request bodies, responses) and builds a registry of Dart symbols with their kinds
and output paths.

TECHNICAL DEBT RESOLVED: normalize_nullable_schema moved to schema_normalizer.py

This module must not:
- render templates
- mutate generation plans
- decide Dart class content
- perform type resolution (use types.py)
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dart.classify.schemas import classify_schema
from constants.dart_syntax import format_package_import
from constants.dart_types import DART_BOOL, DART_DATE_TIME, DART_INT, DART_NUM, DART_OBJECT, DART_STRING
from constants.openapi_keys import (
    OPENAPI_COMPONENTS,
    OPENAPI_FORMAT,
    OPENAPI_FORMAT_DATE_TIME,
    OPENAPI_SCHEMAS,
    OPENAPI_TYPE,
    OPENAPI_TYPE_BOOLEAN,
    OPENAPI_TYPE_INTEGER,
    OPENAPI_TYPE_NUMBER,
    OPENAPI_TYPE_STRING,
)
from dart.domain.kinds import SchemaKind
from dart.planning.operation_usage import collect_schema_usage
from dart.render.paths import schema_output_path
from dart.type_system.schema_normalizer import normalize_nullable_schema
from utils.naming import pascal_case

Schema = dict[str, Any]
OpenApiSpec = dict[str, Any]


@dataclass(frozen=True)
class DartSymbol:
    schema_name: str
    dart_name: str
    kind: SchemaKind
    path: Path | None

    @property
    def is_generated_file(self) -> bool:
        return self.path is not None

    def package_import(self, package_name: str) -> str | None:
        if not self.path:
            return None

        return format_package_import(package_name, self.path.as_posix())


def build_schema_registry(spec: OpenApiSpec) -> dict[str, DartSymbol]:
    schemas = spec.get(OPENAPI_COMPONENTS, {}).get(OPENAPI_SCHEMAS, {})
    registry: dict[str, DartSymbol] = {}

    # Collect operation usage for DTO placement
    usage_by_schema = collect_schema_usage(spec)

    for schema_name, schema in sorted(schemas.items()):
        kind = classify_schema(schema_name, schema)

        usage = usage_by_schema.get(schema_name)

        registry[schema_name] = DartSymbol(
            schema_name=schema_name,
            dart_name=resolve_symbol_dart_name(schema_name, schema, kind),
            kind=kind,
            path=schema_output_path(schema_name, kind, schema=schema, usage=usage),
        )

    return registry


def resolve_symbol_dart_name(schema_name: str, schema: Schema, kind: SchemaKind) -> str:
    if kind == SchemaKind.PRIMITIVE_ALIAS:
        return primitive_alias_type(schema)

    return pascal_case(schema_name)


def primitive_alias_type(schema: Schema) -> str:
    # Normalize nullable anyOf schemas first
    schema, _ = normalize_nullable_schema(schema)

    schema_type = schema.get(OPENAPI_TYPE)
    schema_format = schema.get(OPENAPI_FORMAT)

    if schema_type == OPENAPI_TYPE_STRING and schema_format == OPENAPI_FORMAT_DATE_TIME:
        return DART_DATE_TIME

    if schema_type == OPENAPI_TYPE_STRING:
        return DART_STRING

    if schema_type == OPENAPI_TYPE_INTEGER:
        return DART_INT

    if schema_type == OPENAPI_TYPE_NUMBER:
        return DART_NUM

    if schema_type == OPENAPI_TYPE_BOOLEAN:
        return DART_BOOL

    return DART_OBJECT
