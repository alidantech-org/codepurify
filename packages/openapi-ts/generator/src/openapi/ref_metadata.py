from __future__ import annotations

from typing import Any

from core.constants import REF_KEY
from inference.models import InferredResource, InferredSchemaKind
from openapi.document import OpenApiDocument
from openapi.refs import get_ref


def infer_kind_from_ref_alias(
    schema: dict[str, Any],
    document: OpenApiDocument,
    seen: set[str] | None = None,
) -> InferredSchemaKind | None:
    ref = get_ref(schema)
    if ref is None or ref.section != "schemas" or ref.name is None:
        return None

    seen = seen or set()
    if ref.raw in seen:
        return None

    seen.add(ref.raw)

    target = document.schemas.get(ref.name)
    if not isinstance(target, dict):
        return None

    from inference.classifiers import classify_schema

    return classify_schema(ref.name, target, document=document, seen_refs=seen)


def infer_resource_from_ref_alias(
    schema: dict[str, Any],
    document: OpenApiDocument,
    seen: set[str] | None = None,
) -> InferredResource | None:
    ref = get_ref(schema)
    if ref is None or ref.section != "schemas" or ref.name is None:
        return None

    seen = seen or set()
    if ref.raw in seen:
        return None

    seen.add(ref.raw)

    target = document.schemas.get(ref.name)
    if not isinstance(target, dict):
        return None

    x_codegen = target.get("x-codegen")
    if isinstance(x_codegen, dict):
        resource = _extract_resource(x_codegen)
        if resource is not None:
            return resource

    return infer_resource_from_ref_alias(target, document, seen)


def _extract_resource(x_codegen: dict[str, Any]) -> InferredResource | None:
    resource = x_codegen.get("resource")

    if isinstance(resource, str):
        return InferredResource(name=resource)

    if not isinstance(resource, dict):
        return None

    name = resource.get("name")
    raw_path = resource.get("path", ())

    if not isinstance(name, str) or not name:
        return None

    if isinstance(raw_path, list):
        path = tuple(str(part) for part in raw_path)
    elif isinstance(raw_path, str):
        path = (raw_path,)
    else:
        path = ()

    return InferredResource(name=name, path=path)
