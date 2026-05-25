"""Primitive schema inference.

This module provides utilities for inferring primitive type information
from OpenAPI schema objects including type, format, and query metadata.
"""

from typing import Any

from constants.codegen import X_CODEGEN, QUERY, FILTER, OPERATORS, SORT, SELECT
from constants.openapi import TYPE, FORMAT


def infer_primitive_type(schema: dict[str, Any] | None) -> str | None:
    """Infer primitive type from an OpenAPI schema object.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        The primitive type string, or None if not found.
    """
    if not isinstance(schema, dict):
        return None

    raw_type = schema.get(TYPE)
    if isinstance(raw_type, str):
        return raw_type

    if isinstance(raw_type, list):
        # Get the non-null type from type arrays
        non_null_types = [t for t in raw_type if t != "null"]
        return non_null_types[0] if non_null_types else None

    return None


def infer_primitive_format(schema: dict[str, Any] | None) -> str | None:
    """Infer primitive format from an OpenAPI schema object.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        The format string, or None if not found.
    """
    if not isinstance(schema, dict):
        return None

    format_value = schema.get(FORMAT)
    if isinstance(format_value, str):
        return format_value

    return None


def infer_primitive_query_meta(schema: dict[str, Any] | None) -> dict[str, Any]:
    """Infer query metadata from x-codegen.query.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        A dictionary of query metadata keys (filter, operators, sort, select).
    """
    if not isinstance(schema, dict):
        return {}

    x_codegen = schema.get(X_CODEGEN)
    if not isinstance(x_codegen, dict):
        return {}

    query = x_codegen.get(QUERY)
    if not isinstance(query, dict):
        return {}

    result: dict[str, Any] = {}

    if query.get(FILTER) is not None:
        result[FILTER] = query[FILTER]
    if query.get(OPERATORS) is not None:
        result[OPERATORS] = query[OPERATORS]
    if query.get(SORT) is not None:
        result[SORT] = query[SORT]
    if query.get(SELECT) is not None:
        result[SELECT] = query[SELECT]

    return result
