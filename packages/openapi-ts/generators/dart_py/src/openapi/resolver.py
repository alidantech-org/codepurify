from typing import Any

from constants.openapi_keys import OPENAPI_REF, REF_PREFIX

OpenApiSpec = dict[str, Any]


def is_ref(value: Any) -> bool:
    return isinstance(value, dict) and OPENAPI_REF in value


def ref_name(ref: str) -> str:
    return ref.split("/")[-1]


def resolve_ref(spec: OpenApiSpec, ref: str) -> dict[str, Any]:
    if not ref.startswith(REF_PREFIX):
        raise ValueError(f"Only local refs are supported for now: {ref}")

    current: Any = spec

    for part in ref.removeprefix(REF_PREFIX).split("/"):
        if not isinstance(current, dict) or part not in current:
            raise KeyError(f"Invalid OpenAPI ref: {ref}")

        current = current[part]

    if not isinstance(current, dict):
        raise ValueError(f"Resolved ref is not an object: {ref}")

    return current
