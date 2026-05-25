from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from core.constants import COMPONENT_SECTIONS
from openapi.document import OpenApiDocument
from openapi.refs import OpenApiRef


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
