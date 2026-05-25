"""Schema inference layer.

This package provides utilities for inferring schema structure including
fields, aliases, enums, composition, and metadata from OpenAPI schemas.
"""

from __future__ import annotations

from typing import Any

from constants.codegen import X_CODEGEN
from constants.openapi import COMP_REF_SCHEMAS
from inference.classifiers import classify_schema
from inference.models import InferredResource, InferredSchema, InferredSchemaKind
from inference.resources import extract_resource_from_x_codegen
from inference.schemas.composition import get_composition_refs, get_inherited_refs, infer_composition
from inference.schemas.enums import infer_enum_type, infer_enum_values
from inference.schemas.fields import infer_schema_fields
from inference.schemas.primitives import infer_primitive_format, infer_primitive_query_meta, infer_primitive_type
from inference.schemas.resolution import resolve_schema_alias
from openapi.document import OpenApiDocument
from openapi.refs import find_refs, get_ref


def infer_schemas(document: OpenApiDocument) -> tuple[InferredSchema, ...]:
    schemas: list[InferredSchema] = []

    for name, schema in document.schemas.items():
        if not isinstance(schema, dict):
            continue

        ref = f"{COMP_REF_SCHEMAS}{name}"
        x_codegen = schema.get(X_CODEGEN)
        x_codegen_dict = x_codegen if isinstance(x_codegen, dict) else {}

        alias_info = _detect_alias(schema)
        is_alias = alias_info is not None
        alias_of = alias_info if is_alias else None

        schemas.append(
            InferredSchema(
                name=str(name),
                ref=ref,
                kind=classify_schema(str(name), schema, document=document),
                resource=extract_resource_from_x_codegen(x_codegen_dict) or _infer_resource_from_alias(schema, document),
                x_codegen=x_codegen_dict,
                raw=schema,
                dependencies=_dedupe_dependencies(ref.raw for ref in find_refs(schema) if ref.raw != f"{COMP_REF_SCHEMAS}{name}"),
                alias_of=alias_of,
                is_alias=is_alias,
                **_infer_kind_specific_fields(schema, classify_schema(str(name), schema, document=document), document),
            )
        )

    return tuple(schemas)


def _infer_resource_from_alias(
    schema: dict[str, Any],
    document: OpenApiDocument,
) -> InferredResource | None:
    from inference.ref_metadata import infer_resource_from_ref_alias

    return infer_resource_from_ref_alias(schema, document)


def _detect_alias(schema: dict[str, Any]) -> str | None:
    ref = get_ref(schema)
    if ref is not None and ref.is_component:
        return ref.raw
    return None


def _dedupe_dependencies(dependencies: Any) -> tuple[str, ...]:
    """Deduplicate dependency refs while preserving order.

    Args:
        dependencies: An iterable of dependency refs.

    Returns:
        A tuple of unique dependency refs in order of first appearance.
    """
    seen: set[str] = set()
    result: list[str] = []

    for dep in dependencies:
        if dep not in seen:
            seen.add(dep)
            result.append(dep)

    return tuple(result)


def _infer_kind_specific_fields(schema: dict[str, Any], kind: InferredSchemaKind, document: OpenApiDocument) -> dict[str, Any]:
    """Infer kind-specific fields based on schema kind.

    Args:
        schema: An OpenAPI schema object.
        kind: The inferred schema kind.
        document: The OpenAPI document for alias resolution.

    Returns:
        A dictionary of kind-specific fields to add to InferredSchema.
    """
    # Resolve effective schema for type/format/enum/field details
    effective_schema = resolve_schema_alias(document, schema) or schema

    if kind == InferredSchemaKind.PRIMITIVE:
        return {
            "primitive_type": infer_primitive_type(effective_schema),
            "primitive_format": infer_primitive_format(effective_schema),
            "primitive_query": infer_primitive_query_meta(effective_schema),
            "fields": (),
            "composition_refs": (),
            "inherited_refs": (),
            "composition": None,
        }

    if kind == InferredSchemaKind.ENUM:
        return {
            "enum_type": infer_enum_type(effective_schema),
            "enum_values": infer_enum_values(effective_schema),
            "fields": (),
            "composition_refs": (),
            "inherited_refs": (),
            "composition": None,
        }

    if kind in (InferredSchemaKind.MODEL, InferredSchemaKind.DTO):
        return {
            "fields": infer_schema_fields(effective_schema, document),
            "composition_refs": get_composition_refs(effective_schema),
            "inherited_refs": get_inherited_refs(effective_schema),
            "composition": infer_composition(effective_schema),
        }

    # UNKNOWN or other kinds
    return {
        "fields": (),
        "composition_refs": (),
        "inherited_refs": (),
        "composition": None,
    }


__all__ = ["infer_schemas"]
