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
)
from ..type_system.schema_normalizer import is_enum_schema, is_object_like_schema
from constants.rules import DTO_SUFFIXES, PRIMITIVE_ALIAS_SUFFIXES, PRIMITIVE_TYPES
from openapi.codegen_metadata import read_codegen_metadata
from ..domain.kinds import SchemaKind

Schema = dict[str, Any]


def is_property_schema(schema: Schema) -> bool:
    """Check if schema is a property (primitive without enum values)."""
    from openapi.codegen_metadata import read_codegen_metadata

    meta = read_codegen_metadata(schema)
    if meta.kind == "property":
        return True
    return False


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

    # Priority 0: Schema shape wins for enums
    # If the schema has enum values at root, it's an enum regardless of metadata
    if is_enum_schema(schema):
        return SchemaKind.ENUM

    # Priority 0.5: Schema shape wins for object-like schemas
    # If the schema is object-like (has properties or is object type),
    # it should be classified as MODEL/DTO/QUERY, never as property or skip
    if is_object_like_schema(schema):
        # Object-like schemas cannot be properties - they must be models/DTOs
        # Read metadata to determine which kind (model/dto/query)
        meta = read_codegen_metadata(schema)

        if meta.is_skipped:
            # Even if metadata says skip, object shape wins - this is likely a metadata error
            # Fall through to shape-based classification
            pass
        elif meta.kind:
            kind_map = {
                SDK_KIND_MODEL: SchemaKind.MODEL,
                SDK_KIND_DTO: SchemaKind.DTO,
                "query": SchemaKind.QUERY,
            }
            # Only respect metadata if it's a valid object kind
            if meta.kind in kind_map:
                return kind_map[meta.kind]
            # If metadata says property/skip/enum for object schema, ignore it and fall through

        # Fallback to shape-based classification for object-like schemas
        if is_dto_schema(name, schema):
            return SchemaKind.DTO
        return SchemaKind.MODEL

    # Priority 1: Check x-codegen metadata for scalar schemas
    meta = read_codegen_metadata(schema)

    if meta.is_skipped:
        return SchemaKind.SKIP

    if meta.kind:
        kind_map = {
            SDK_KIND_PRIMITIVE: SchemaKind.PRIMITIVE_ALIAS,
            SDK_KIND_MODEL: SchemaKind.MODEL,
            SDK_KIND_DTO: SchemaKind.DTO,
            SDK_KIND_ENUM: SchemaKind.ENUM,  # Only used if schema shape also supports it
            SDK_KIND_SKIP: SchemaKind.SKIP,
            "query": SchemaKind.QUERY,
        }
        # Don't allow metadata to override schema shape for enums
        if meta.kind == SDK_KIND_ENUM and not is_enum_schema(schema):
            # Metadata says enum but schema is not enum-shaped - warn/fail
            # For now, fall through to shape-based classification
            pass
        else:
            return kind_map.get(meta.kind, SchemaKind.SKIP)

    # Priority 2: Fallback to shape-based inference
    if is_primitive_alias(name, schema):
        return SchemaKind.PRIMITIVE_ALIAS

    if is_dto_schema(name, schema):
        return SchemaKind.DTO

    if is_object_schema(schema):
        return SchemaKind.MODEL

    return SchemaKind.SKIP
