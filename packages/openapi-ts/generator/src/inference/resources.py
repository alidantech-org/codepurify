from __future__ import annotations

from typing import Any

from constants.codegen import RESOURCE, NAME, KEY, PATH
from inference.models import InferredResource


def make_resource(
    name: str,
    path: tuple[str, ...] = (),
    key: str | None = None,
) -> InferredResource:
    clean_name = name.strip()
    clean_key = key.strip() if isinstance(key, str) and key.strip() else clean_name

    return InferredResource(
        name=clean_name,
        key=clean_key,
        path=path,
    )


def extract_resource_from_x_codegen(x_codegen: dict[str, Any]) -> InferredResource | None:
    resource = x_codegen.get(RESOURCE)

    if isinstance(resource, str):
        return make_resource(name=resource, key=resource)

    if not isinstance(resource, dict):
        return None

    name = resource.get(NAME)
    raw_path = resource.get(PATH, ())

    # Important:
    # Only use an explicit resource.key.
    # Do not use group as resource key.
    # group can be used later for folder grouping, but it is not identity.
    key = resource.get(KEY)

    if not isinstance(name, str) or not name.strip():
        return None

    if isinstance(raw_path, list):
        path = tuple(str(part) for part in raw_path)
    elif isinstance(raw_path, str):
        path = (raw_path,)
    else:
        path = ()

    return make_resource(name=name, key=key, path=path)
