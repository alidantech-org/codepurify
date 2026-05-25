"""Schema composition inference.

This module provides utilities for inferring composition information from
OpenAPI schema objects including allOf, anyOf, and oneOf.
"""

from typing import Any

from constants.openapi import ALL_OF, ANY_OF, ONE_OF, COMPOSITION_ALL_OF, COMPOSITION_ANY_OF, COMPOSITION_ONE_OF
from openapi.refs import get_ref

from inference.models.schemas import InferredSchemaComposition


def infer_composition(schema: dict[str, Any] | None) -> InferredSchemaComposition | None:
    """Infer composition from an OpenAPI schema object.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        An InferredSchemaComposition object if composition exists, None otherwise.
    """
    if not isinstance(schema, dict):
        return None

    # Check for allOf
    all_of = schema.get(ALL_OF)
    if isinstance(all_of, list) and all_of:
        refs = _get_composition_refs(all_of)
        inline_count = _count_inline_objects(all_of)
        return InferredSchemaComposition(
            kind=COMPOSITION_ALL_OF,
            refs=refs,
            inline_field_count=inline_count,
        )

    # Check for anyOf
    any_of = schema.get(ANY_OF)
    if isinstance(any_of, list) and any_of:
        refs = _get_composition_refs(any_of)
        inline_count = _count_inline_objects(any_of)
        return InferredSchemaComposition(
            kind=COMPOSITION_ANY_OF,
            refs=refs,
            inline_field_count=inline_count,
        )

    # Check for oneOf
    one_of = schema.get(ONE_OF)
    if isinstance(one_of, list) and one_of:
        refs = _get_composition_refs(one_of)
        inline_count = _count_inline_objects(one_of)
        return InferredSchemaComposition(
            kind=COMPOSITION_ONE_OF,
            refs=refs,
            inline_field_count=inline_count,
        )

    return None


def get_composition_refs(schema: dict[str, Any] | None) -> tuple[str, ...]:
    """Get all composition refs from an OpenAPI schema object.

    Args:
        schema: An OpenAPI schema object.

    Returns:
        A tuple of schema reference strings from allOf/anyOf/oneOf.
    """
    if not isinstance(schema, dict):
        return ()

    refs: list[str] = []

    for key in (ALL_OF, ANY_OF, ONE_OF):
        items = schema.get(key)
        if isinstance(items, list):
            for item in items:
                if isinstance(item, dict):
                    ref = get_ref(item)
                    if ref:
                        refs.append(ref.raw)

    return tuple(refs)


def get_inherited_refs(schema: dict[str, Any] | None) -> tuple[str, ...]:
    """Get inherited refs from allOf (used for inheritance).

    Args:
        schema: An OpenAPI schema object.

    Returns:
        A tuple of schema reference strings from allOf only.
    """
    if not isinstance(schema, dict):
        return ()

    refs: list[str] = []

    all_of = schema.get(ALL_OF)
    if isinstance(all_of, list):
        for item in all_of:
            if isinstance(item, dict):
                ref = get_ref(item)
                if ref:
                    refs.append(ref.raw)

    return tuple(refs)


def _get_composition_refs(items: list[dict[str, Any]]) -> tuple[str, ...]:
    """Get refs from a composition items list.

    Args:
        items: A list of composition items (allOf/anyOf/oneOf).

    Returns:
        A tuple of schema reference strings.
    """
    refs: list[str] = []

    for item in items:
        if isinstance(item, dict):
            ref = get_ref(item)
            if ref:
                refs.append(ref.raw)

    return tuple(refs)


def _count_inline_objects(items: list[dict[str, Any]]) -> int:
    """Count inline objects in a composition items list.

    Args:
        items: A list of composition items (allOf/anyOf/oneOf).

    Returns:
        The count of inline objects (non-ref items).
    """
    count = 0

    for item in items:
        if isinstance(item, dict):
            if get_ref(item) is None:
                count += 1

    return count
