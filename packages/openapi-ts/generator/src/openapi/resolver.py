from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from constants.openapi import (
    COMP_PARAMETERS,
    COMP_REF_PARAMETERS,
    COMP_REF_REQUEST_BODIES,
    COMP_REF_RESPONSES,
    COMP_REQUEST_BODIES,
    COMP_RESPONSES,
    COMPONENT_SECTIONS,
    SCHEMA,
)
from openapi.document import OpenApiDocument
from openapi.refs import OpenApiRef, get_ref


@dataclass(frozen=True)
class ComponentIndex:
    components: dict[tuple[str, str], dict[str, Any]]

    def has(self, ref: OpenApiRef) -> bool:
        key = ref.component_key
        return key is not None and key in self.components

    def get(self, ref: OpenApiRef) -> dict[str, Any] | None:
        key = ref.component_key

        if key is None:
            return None

        return self.components.get(key)


def build_component_index(document: OpenApiDocument) -> ComponentIndex:
    components: dict[tuple[str, str], dict[str, Any]] = {}

    for section in COMPONENT_SECTIONS:
        section_value = document.components.get(section)

        if not isinstance(section_value, dict):
            continue

        for name, value in section_value.items():
            if isinstance(value, dict):
                components[(section, str(name))] = value

    return ComponentIndex(components=components)


def resolve_parameter_ref(ref: str, document: OpenApiDocument) -> dict[str, Any] | None:
    """Resolve a parameter component ref to its definition."""
    if not ref.startswith(COMP_REF_PARAMETERS):
        return None

    name = ref.replace(COMP_REF_PARAMETERS, "")
    parameters = document.components.get(COMP_PARAMETERS)

    if not isinstance(parameters, dict):
        return None

    return parameters.get(name)


def resolve_request_body_ref(ref: str, document: OpenApiDocument) -> dict[str, Any] | None:
    """Resolve a requestBody component ref to its definition."""
    if not ref.startswith(COMP_REF_REQUEST_BODIES):
        return None

    name = ref.replace(COMP_REF_REQUEST_BODIES, "")
    request_bodies = document.components.get(COMP_REQUEST_BODIES)

    if not isinstance(request_bodies, dict):
        return None

    return request_bodies.get(name)


def resolve_response_ref(ref: str, document: OpenApiDocument) -> dict[str, Any] | None:
    """Resolve a response component ref to its definition."""
    if not ref.startswith(COMP_REF_RESPONSES):
        return None

    name = ref.replace(COMP_REF_RESPONSES, "")
    responses = document.components.get(COMP_RESPONSES)

    if not isinstance(responses, dict):
        return None

    return responses.get(name)


def extract_content_types(content: dict[str, Any] | None) -> tuple[str, ...]:
    """Extract content type strings from a content object."""
    if not isinstance(content, dict):
        return ()

    return tuple(content.keys())


def extract_schema_refs_from_content(content: dict[str, Any] | None) -> tuple[str, ...]:
    """Extract schema refs from a content object."""
    if not isinstance(content, dict):
        return ()

    refs: list[str] = []

    for _media_type, media_content in content.items():
        if not isinstance(media_content, dict):
            continue

        schema = media_content.get(SCHEMA)
        ref = get_ref(schema)

        if ref is not None:
            refs.append(ref.raw)

    return tuple(refs)
