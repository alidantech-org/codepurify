from typing import Any

from constants.openapi_keys import OPENAPI_COMPONENTS, OPENAPI_PATHS, OPENAPI_VERSION

OpenApiSpec = dict[str, Any]


def validate_openapi_shape(spec: OpenApiSpec) -> None:
    if OPENAPI_VERSION not in spec:
        raise ValueError(f"Missing required OpenAPI field: {OPENAPI_VERSION}")

    if OPENAPI_PATHS not in spec:
        raise ValueError(f"Missing required OpenAPI field: {OPENAPI_PATHS}")

    if not isinstance(spec[OPENAPI_PATHS], dict):
        raise ValueError("OpenAPI paths must be an object")

    components = spec.get(OPENAPI_COMPONENTS, {})

    if components and not isinstance(components, dict):
        raise ValueError("OpenAPI components must be an object")
