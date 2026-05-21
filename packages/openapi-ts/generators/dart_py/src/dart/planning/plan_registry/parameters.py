"""
OpenAPI parameter planning helpers.

This module extracts path/query/header/cookie parameters from both path-level
and operation-level OpenAPI parameter lists.

It supports:
- inline parameters
- local $ref parameters from #/components/parameters/*
"""

from typing import Any

from constants.openapi_keys import (
    OPENAPI_COMPONENTS,
    OPENAPI_IN,
    OPENAPI_NAME,
    OPENAPI_PARAMETERS,
    OPENAPI_REF,
    REF_PREFIX_COMPONENTS_PARAMETERS,
)

OpenApiSpec = dict[str, Any]


def extract_parameters(
    spec: OpenApiSpec,
    operation: dict,
    path_item: dict,
    location: str,
) -> list[dict]:
    """
    Extract path-level and operation-level parameters by location.

    Operation-level parameters should override path-level parameters with the
    same `(name, in)` pair.
    """
    parameters_by_key: dict[tuple[str, str], dict] = {}

    for param in path_item.get(OPENAPI_PARAMETERS, []):
        resolved = resolve_parameter(spec, param)

        if is_parameter_at_location(resolved, location):
            key = get_parameter_key(resolved)
            if key:
                parameters_by_key[key] = resolved

    for param in operation.get(OPENAPI_PARAMETERS, []):
        resolved = resolve_parameter(spec, param)

        if is_parameter_at_location(resolved, location):
            key = get_parameter_key(resolved)
            if key:
                parameters_by_key[key] = resolved

    return list(parameters_by_key.values())


def resolve_parameter(
    spec: OpenApiSpec,
    parameter: object,
) -> dict:
    """Resolve an inline or local $ref OpenAPI parameter."""
    if not isinstance(parameter, dict):
        return {}

    ref = parameter.get(OPENAPI_REF)

    if isinstance(ref, str):
        return resolve_parameter_ref(spec, ref)

    return parameter


def resolve_parameter_ref(
    spec: OpenApiSpec,
    ref: str,
) -> dict:
    """Resolve a local #/components/parameters/* parameter reference."""
    if not ref.startswith(REF_PREFIX_COMPONENTS_PARAMETERS):
        return {}

    parameter_name = ref.rsplit("/", 1)[-1]

    components = spec.get(OPENAPI_COMPONENTS, {})
    if not isinstance(components, dict):
        return {}

    parameters = components.get(OPENAPI_PARAMETERS, {})
    if not isinstance(parameters, dict):
        return {}

    resolved = parameters.get(parameter_name, {})

    if not isinstance(resolved, dict):
        return {}

    return resolved


def is_parameter_at_location(
    value: object,
    location: str,
) -> bool:
    """Return true if a value is an OpenAPI parameter at the target location."""
    return isinstance(value, dict) and value.get(OPENAPI_IN) == location


def get_parameter_key(
    parameter: dict,
) -> tuple[str, str] | None:
    """Return stable dedupe key for a parameter."""
    name = parameter.get(OPENAPI_NAME)
    location = parameter.get(OPENAPI_IN)

    if not isinstance(name, str) or not isinstance(location, str):
        return None

    return name, location
