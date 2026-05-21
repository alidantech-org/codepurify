"""
Schema classification logic for Dart SDK generation.

This module answers: what artifact should this OpenAPI schema become?
It classifies schemas into MODEL, DTO, ENUM, PRIMITIVE_ALIAS, or SKIP based on
schema structure, naming patterns, and x-sdk extensions.

This module must not:
- produce Dart code
- build full class field plans
- decide imports
- write files
- render templates
"""

from typing import Any

from constants.openapi_keys import OPENAPI_ENUM, OPENAPI_PROPERTIES, OPENAPI_TYPE, OPENAPI_TYPE_OBJECT
from constants.sdk_tags import (
    SDK_KIND_DTO,
    SDK_KIND_ENUM,
    SDK_KIND_MODEL,
    SDK_KIND_PRIMITIVE,
    SDK_KIND_SKIP,
    X_SDK_KIND,
    X_SDK_SKIP,
)
from constants.rules import DTO_SUFFIXES, PRIMITIVE_ALIAS_SUFFIXES, PRIMITIVE_TYPES
from ..domain.kinds import SchemaKind

Schema = dict[str, Any]


def is_enum_schema(schema: Schema) -> bool:
    return bool(schema.get(OPENAPI_ENUM))


def is_object_schema(schema: Schema) -> bool:
    return schema.get(OPENAPI_TYPE) == OPENAPI_TYPE_OBJECT and bool(schema.get(OPENAPI_PROPERTIES))


def is_primitive_alias(name: str, schema: Schema) -> bool:
    if schema.get(OPENAPI_ENUM):
        return False

    if schema.get(OPENAPI_PROPERTIES):
        return False

    schema_type = schema.get(OPENAPI_TYPE)

    if schema_type in PRIMITIVE_TYPES:
        return True

    if name.endswith(PRIMITIVE_ALIAS_SUFFIXES):
        return True

    return False


def is_dto_schema(name: str, schema: Schema) -> bool:
    if not is_object_schema(schema):
        return False

    return name.endswith(DTO_SUFFIXES)


def classify_schema(name: str, schema: Schema) -> SchemaKind:
    if not isinstance(schema, dict):
        return SchemaKind.SKIP

    # Priority 0: Check x-sdk-skip extension
    sdk_skip = schema.get(X_SDK_SKIP)
    if sdk_skip is True:
        return SchemaKind.SKIP

    # Priority 1: Check x-sdk-kind extension
    sdk_kind = schema.get(X_SDK_KIND)
    if sdk_kind:
        kind_map = {
            SDK_KIND_PRIMITIVE: SchemaKind.PRIMITIVE_ALIAS,
            SDK_KIND_MODEL: SchemaKind.MODEL,
            SDK_KIND_DTO: SchemaKind.DTO,
            SDK_KIND_ENUM: SchemaKind.ENUM,
            SDK_KIND_SKIP: SchemaKind.SKIP,
        }
        return kind_map.get(sdk_kind, SchemaKind.SKIP)

    # Priority 2: Fallback to old inference logic
    if is_enum_schema(schema):
        return SchemaKind.ENUM

    if is_primitive_alias(name, schema):
        return SchemaKind.PRIMITIVE_ALIAS

    if is_dto_schema(name, schema):
        return SchemaKind.DTO

    if is_object_schema(schema):
        return SchemaKind.MODEL

    return SchemaKind.SKIP
