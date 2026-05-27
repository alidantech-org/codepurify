from __future__ import annotations

from typing import Any

from constants.codegen import RESOURCE, NAME, PATH
from inference.models import InferredResource


def make_resource(
    name: str,
    path: tuple[str, ...] = (),
) -> InferredResource:
    clean_name = name.strip()

    return InferredResource(
        name=clean_name,
        path=path,
    )


def extract_resource_from_x_codegen(x_codegen: dict[str, Any]) -> InferredResource | None:
    resource = x_codegen.get(RESOURCE)

    if isinstance(resource, str):
        return make_resource(name=resource)

    if not isinstance(resource, dict):
        return None

    name = resource.get(NAME)
    raw_path = resource.get(PATH, ())

    if not isinstance(name, str) or not name.strip():
        return None

    path = _resource_path(raw_path)

    return make_resource(name=name, path=path)


def _resource_path(raw_path: Any) -> tuple[str, ...]:
    if not isinstance(raw_path, list | tuple):
        return ()

    if not all(isinstance(part, str) and part.strip() for part in raw_path):
        return ()

    return tuple(part.strip() for part in raw_path)
