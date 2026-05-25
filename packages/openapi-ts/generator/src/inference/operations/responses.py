from __future__ import annotations

from typing import Any

from constants.openapi import (
    CONTENT,
    DESCRIPTION,
    SCHEMA,
    STATUS_DEFAULT,
    STATUS_ERROR_MIN,
    STATUS_SUCCESS_MAX,
    STATUS_SUCCESS_MIN,
)
from inference.models import InferredMediaType, InferredResponse
from openapi.document import OpenApiDocument
from openapi.refs import get_ref
from openapi.resolver import extract_content_types, extract_schema_refs_from_content


def infer_responses(
    responses: Any,
    _document: OpenApiDocument,
) -> tuple[InferredResponse, ...]:
    """Infer responses from operation."""
    if not isinstance(responses, dict):
        return ()

    result: list[InferredResponse] = []

    for status_code, response in responses.items():
        if not isinstance(response, dict):
            continue

        ref = get_ref(response)
        description = response.get(DESCRIPTION, "")
        content = response.get(CONTENT)

        content_types = extract_content_types(content)
        media_types = _infer_media_types(content)
        schema_refs = extract_schema_refs_from_content(content)

        is_success = _is_success_status(status_code)
        is_error = _is_error_status(status_code)

        result.append(
            InferredResponse(
                status_code=str(status_code),
                ref=ref.raw if ref else None,
                description=description,
                content_types=content_types,
                media_types=media_types,
                schema_refs=schema_refs,
                is_success=is_success,
                is_error=is_error,
            )
        )

    return tuple(result)


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


def _is_success_status(status_code: str) -> bool:
    """Check if status code indicates success (2xx)."""
    try:
        code = int(status_code)
        return STATUS_SUCCESS_MIN <= code < STATUS_SUCCESS_MAX
    except (ValueError, TypeError):
        return False


def _is_error_status(status_code: str) -> bool:
    """Check if status code indicates error (4xx, 5xx, or default)."""
    if status_code == STATUS_DEFAULT:
        return True

    try:
        code = int(status_code)
        return code >= STATUS_ERROR_MIN
    except (ValueError, TypeError):
        return False
