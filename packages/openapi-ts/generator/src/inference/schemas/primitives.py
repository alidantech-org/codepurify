"""Primitive schema inference.

This module provides utilities for inferring primitive type information
from OpenAPI schema objects including type, format, and query metadata.
"""

from typing import Any

from constants.codegen import FILTER, OPERATORS, QUERY, SELECT, SORT, X_CODEGEN
from constants.openapi import FORMAT, TYPE, TYPE_NULL
from inference.models.schemas import QueryMetadata


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
        non_null_types = [t for t in raw_type if t != TYPE_NULL]
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


def infer_primitive_query_meta(schema: dict[str, Any] | None) -> QueryMetadata:
    """Infer query metadata from x-codegen.query.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        A QueryMetadata object with query metadata keys.
    """
    if not isinstance(schema, dict):
        return QueryMetadata()

    x_codegen = schema.get(X_CODEGEN)
    if not isinstance(x_codegen, dict):
        return QueryMetadata()

    query = x_codegen.get(QUERY)
    if not isinstance(query, dict):
        return QueryMetadata()

    return QueryMetadata(
        filter=query.get(FILTER),
        operators=query.get(OPERATORS),
        sort=query.get(SORT),
        select=query.get(SELECT),
    )
