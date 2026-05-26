"""Query options extraction from x-codegen metadata.

This module extracts query behavior metadata from x-codegen extensions
and converts it to ApiQueryOptions for field and schema contracts.
"""

from __future__ import annotations

from typing import Any

from contracts.api import ApiQueryOptions


def build_query_options(raw_x_codegen: dict[str, Any] | None) -> ApiQueryOptions:
    """Build query options from raw x-codegen metadata.

    Args:
        raw_x_codegen: The raw x-codegen dictionary from OpenAPI schema.

    Returns:
        ApiQueryOptions with extracted query behavior.
    """
    if not raw_x_codegen:
        return ApiQueryOptions()

    query_data = raw_x_codegen.get("query", {})
    if not query_data:
        return ApiQueryOptions()

    operators = query_data.get("operators", [])
    if isinstance(operators, str):
        operators = [operators]
    elif not isinstance(operators, list | tuple):
        operators = []

    return ApiQueryOptions(
        filter=bool(query_data.get("filter", False)),
        operators=tuple(str(op) for op in operators),
        sort=bool(query_data.get("sort", False)),
        select=bool(query_data.get("select", False)),
        search=bool(query_data.get("search", False)),
        exact=bool(query_data.get("exact", False)),
        meta={"raw": query_data},
    )


def merge_query_options(primary: ApiQueryOptions, fallback: ApiQueryOptions) -> ApiQueryOptions:
    """Merge query options with primary taking precedence.

    If primary has any non-default values, they win.
    Otherwise, fallback values are used.

    Args:
        primary: The primary query options (e.g., from field metadata).
        fallback: The fallback query options (e.g., from referenced primitive).

    Returns:
        Merged ApiQueryOptions.
    """
    # If primary has any explicit settings, use it entirely
    if (
        primary.filter
        or primary.operators
        or primary.sort
        or primary.select
        or primary.search
        or primary.exact
    ):
        return primary

    # Otherwise use fallback
    return fallback
