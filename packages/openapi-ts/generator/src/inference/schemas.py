from __future__ import annotations

from typing import Any

from core.constants import X_CODEGEN
from inference.classifiers import classify_schema
from inference.models import InferredResource, InferredSchema
from inference.resources import extract_resource_from_x_codegen
from openapi.document import OpenApiDocument
from openapi.refs import find_refs, get_ref


def infer_schemas(document: OpenApiDocument) -> tuple[InferredSchema, ...]:
    schemas: list[InferredSchema] = []

    for name, schema in document.schemas.items():
        if not isinstance(schema, dict):
            continue

        ref = f"#/components/schemas/{name}"
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
                dependencies=tuple(ref.raw for ref in find_refs(schema) if ref.raw != f"#/components/schemas/{name}"),
                alias_of=alias_of,
                is_alias=is_alias,
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
