"""
Domain name inference utilities for Dart SDK generation.

This module provides functions to infer Dart domain/folder names from schema names,
operation IDs, and tags based on naming conventions and x-sdk extensions.

This module must not:
- parse OpenAPI documents
- classify schemas as class/enum
- render templates
- write files
- build generation plans
"""

from constants.sdk_tags import X_SDK_DOMAIN
from constants.rules import MODEL_VARIANT_PREFIXES, OPERATION_PREFIXES
from utils.naming import snake_case


def strip_prefix(value: str, prefixes: tuple[str, ...]) -> str:
    for prefix in prefixes:
        if value.startswith(prefix) and value != prefix:
            return value.removeprefix(prefix)

    return value


def strip_plural(value: str) -> str:
    if value.endswith("ies") and len(value) > 3:
        return f"{value[:-3]}y"

    if value.endswith("s") and len(value) > 1:
        return value[:-1]

    return value


def infer_model_domain(schema_name: str, schema: dict | None = None) -> str:
    # Priority 1: Check x-sdk-domain extension
    if schema and isinstance(schema, dict):
        sdk_domain = schema.get(X_SDK_DOMAIN)
        if sdk_domain:
            return sdk_domain

    # Priority 2: Fallback to old inference logic
    base = strip_prefix(schema_name, MODEL_VARIANT_PREFIXES)
    return snake_case(base)


def infer_enum_domain(schema_name: str, schema: dict | None = None) -> str:
    # Check x-sdk-domain extension
    if schema and isinstance(schema, dict):
        sdk_domain = schema.get(X_SDK_DOMAIN)
        if sdk_domain:
            return sdk_domain

    # Fallback to model domain inference
    return infer_model_domain(schema_name)


def infer_tag_domain(tag: str) -> str:
    return strip_plural(snake_case(tag))


def infer_operation_name(operation_id: str) -> str:
    return snake_case(operation_id)


def infer_operation_domain(operation_id: str, fallback_tag: str) -> str:
    stripped = strip_prefix(operation_id, OPERATION_PREFIXES)

    if stripped and stripped != operation_id:
        return strip_plural(snake_case(stripped))

    return infer_tag_domain(fallback_tag)
