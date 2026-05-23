"""
Schema kind classification constants and helper functions.

This module provides enums for schema kinds (MODEL, DTO, ENUM, etc.) and helper
functions to detect schema characteristics like nullable primitives, shared DTOs,
and domain models.

This module must not:
- perform full schema classification (use classify.py for that)
- render templates
- write files
- build generation plans
"""

from enum import StrEnum
from typing import Any

from constants.openapi_keys import (
    OPENAPI_ANY_OF,
    OPENAPI_ENUM,
    OPENAPI_ONE_OF,
    OPENAPI_PROPERTIES,
    OPENAPI_TYPE,
    OPENAPI_TYPE_BOOLEAN,
    OPENAPI_TYPE_INTEGER,
    OPENAPI_TYPE_NULL,
    OPENAPI_TYPE_NUMBER,
    OPENAPI_TYPE_OBJECT,
    OPENAPI_TYPE_STRING,
)
from constants.rules import (
    DOMAIN_MODEL_EXCLUSIONS,
    SHARED_DTO_NAMES,
    SHARED_DTO_SUFFIXES,
    SUPPORT_SCHEMA_PATTERNS,
)

Schema = dict[str, Any]


class SchemaKind(StrEnum):
    PRIMITIVE_ALIAS = "primitive_alias"
    ENUM = "enum"
    MODEL = "model"
    DTO = "dto"
    QUERY = "query"
    SKIP = "skip"


class DartFolder(StrEnum):
    MODELS = "models"
    DTOS = "dtos"
    ENUMS = "enums"


def is_nullable_primitive(schema: dict) -> bool:
    """Check if schema is a nullable primitive (anyOf/oneOf with null)."""
    any_of = schema.get(OPENAPI_ANY_OF)
    if any_of and isinstance(any_of, list):
        if len(any_of) == 2:
            has_null = any(item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL for item in any_of if isinstance(item, dict))
            has_primitive = any(
                item.get(OPENAPI_TYPE) in {OPENAPI_TYPE_STRING, OPENAPI_TYPE_INTEGER, OPENAPI_TYPE_NUMBER, OPENAPI_TYPE_BOOLEAN}
                for item in any_of
                if isinstance(item, dict)
            )
            return has_null and has_primitive

    one_of = schema.get(OPENAPI_ONE_OF)
    if one_of and isinstance(one_of, list):
        if len(one_of) == 2:
            has_null = any(item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL for item in one_of if isinstance(item, dict))
            has_primitive = any(
                item.get(OPENAPI_TYPE) in {OPENAPI_TYPE_STRING, OPENAPI_TYPE_INTEGER, OPENAPI_TYPE_NUMBER, OPENAPI_TYPE_BOOLEAN}
                for item in one_of
                if isinstance(item, dict)
            )
            return has_null and has_primitive

    return False


def is_shared_dto_schema(schema_name: str, schema: dict) -> bool:
    """Check if schema is a shared/support DTO like PaginationMeta, ValidationErrors, etc."""
    if schema.get(OPENAPI_TYPE) != OPENAPI_TYPE_OBJECT:
        return False

    if schema_name in SHARED_DTO_NAMES:
        return True

    return schema_name.endswith(SHARED_DTO_SUFFIXES)


def is_support_dto(schema_name: str) -> bool:
    """Check if schema is a support/shared DTO like PaginationMeta, ValidationErrors, etc."""
    # Check for specific support schemas
    if schema_name in SHARED_DTO_NAMES:
        return True

    # Check for patterns (but exclude domain models)
    if schema_name in DOMAIN_MODEL_EXCLUSIONS:
        return False

    return any(pattern in schema_name for pattern in SUPPORT_SCHEMA_PATTERNS)


def is_primitive_alias(schema: dict) -> bool:
    """Check if schema is a primitive alias (single property or simple type)."""
    if OPENAPI_ANY_OF in schema or OPENAPI_ONE_OF in schema:
        return False

    if OPENAPI_TYPE in schema and OPENAPI_PROPERTIES not in schema:
        return True

    properties = schema.get(OPENAPI_PROPERTIES, {})
    if len(properties) == 1:
        return True

    return False


def is_domain_model(schema_name: str) -> bool:
    """Check if schema represents a domain model (business entity)."""
    # Explicitly exclude shared DTOs from being domain models
    if schema_name in SHARED_DTO_NAMES:
        return False

    # Domain models typically don't have these patterns
    return not any(pattern in schema_name for pattern in SUPPORT_SCHEMA_PATTERNS)


def classify_schema(schema_name: str, schema: dict) -> SchemaKind:
    if OPENAPI_ENUM in schema:
        return SchemaKind.ENUM

    if OPENAPI_ANY_OF in schema or OPENAPI_ONE_OF in schema:
        if is_nullable_primitive(schema):
            return SchemaKind.PRIMITIVE_ALIAS
        return SchemaKind.DTO

    schema_type = schema.get(OPENAPI_TYPE)
    if schema_type == OPENAPI_TYPE_OBJECT and OPENAPI_PROPERTIES in schema:
        # Check for shared DTO/support schemas first
        if is_shared_dto_schema(schema_name, schema):
            return SchemaKind.DTO

        # Check if it's a domain model
        if is_domain_model(schema_name):
            return SchemaKind.MODEL

        # Default to DTO for other objects
        return SchemaKind.DTO

    if is_primitive_alias(schema):
        return SchemaKind.PRIMITIVE_ALIAS

    return SchemaKind.SKIP
