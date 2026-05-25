from __future__ import annotations

from typing import Any

from constants.openapi import CONTENT, REQUIRED, SCHEMA
from inference.models import InferredMediaType, InferredRequestBody
from openapi.document import OpenApiDocument
from openapi.refs import get_ref
from openapi.resolver import extract_content_types, extract_schema_refs_from_content


def infer_request_body(
    request_body: Any,
    _document: OpenApiDocument,
) -> InferredRequestBody | None:
    """Infer request body from operation."""
    if not isinstance(request_body, dict):
        return None

    ref = get_ref(request_body)
    content = request_body.get(CONTENT)

    content_types = extract_content_types(content)
    media_types = _infer_media_types(content)
    schema_refs = extract_schema_refs_from_content(content)

    return InferredRequestBody(
        ref=ref.raw if ref else None,
        required=request_body.get(REQUIRED, False),
        content_types=content_types,
        media_types=media_types,
        schema_refs=schema_refs,
    )


def _infer_media_types(content: dict[str, Any] | None) -> tuple[InferredMediaType, ...]:
    """Infer media types from content object."""
    if not isinstance(content, dict):
        return ()

    result: list[InferredMediaType] = []

    for content_type, media_content in content.items():
        if not isinstance(media_content, dict):
            continue

        schema = media_content.get(SCHEMA)
        ref = get_ref(schema)

        result.append(
            InferredMediaType(
                content_type=content_type,
                schema_ref=ref.raw if ref else None,
                schema_refs=tuple([ref.raw]) if ref else (),
            )
        )

    return tuple(result)
