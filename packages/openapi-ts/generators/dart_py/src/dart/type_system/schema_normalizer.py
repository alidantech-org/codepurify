"""
Schema normalization utilities for OpenAPI schemas.

This module provides functions to normalize OpenAPI schemas, particularly
for handling nullable types expressed as anyOf/oneOf with null.

This module must not:
- perform type resolution
- build generation plans
- render Dart code
"""

from typing import Any

from constants.openapi_keys import OPENAPI_ANY_OF, OPENAPI_NULLABLE, OPENAPI_ONE_OF, OPENAPI_TYPE, OPENAPI_TYPE_NULL

Schema = dict[str, Any]


def normalize_nullable_schema(schema: Schema) -> tuple[Schema, bool]:
    """Normalize anyOf/oneOf with null to extract the base type and nullable flag."""
    any_of = schema.get(OPENAPI_ANY_OF)
    if any_of and isinstance(any_of, list):
        # Find the non-null type
        base_type = None
        has_null = False

        for item in any_of:
            if isinstance(item, dict):
                if item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL:
                    has_null = True
                else:
                    base_type = item

        if base_type and has_null:
            return base_type, True

    one_of = schema.get(OPENAPI_ONE_OF)
    if one_of and isinstance(one_of, list):
        # Find the non-null type
        base_type = None
        has_null = False

        for item in one_of:
            if isinstance(item, dict):
                if item.get(OPENAPI_TYPE) == OPENAPI_TYPE_NULL:
                    has_null = True
                else:
                    base_type = item

        if base_type and has_null:
            return base_type, True

    return schema, schema.get(OPENAPI_NULLABLE, False)
