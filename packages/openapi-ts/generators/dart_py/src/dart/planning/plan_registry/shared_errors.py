"""
Shared error response planning helpers.
"""

from constants.openapi_keys import (
    OPENAPI_DEFAULT_RESPONSE,
    OPENAPI_PATHS,
    OPENAPI_RESPONSES,
    SUCCESS_STATUS_MAX,
    SUCCESS_STATUS_MIN,
    SUPPORTED_OPERATION_METHODS,
)
from constants.sdk_usage import SDK_SHARED_ERROR_KEY_FORMAT
from ..operation_usage import extract_schema_from_response

OpenApiSpec = dict[str, object]


def is_success_status(status_code: str) -> bool:
    """Return true when status code is a 2xx response."""
    if status_code == OPENAPI_DEFAULT_RESPONSE:
        return False

    if not status_code.isdigit():
        return False

    code = int(status_code)
    return SUCCESS_STATUS_MIN <= code <= SUCCESS_STATUS_MAX


def collect_shared_error_responses(
    spec: OpenApiSpec,
) -> dict[str, tuple[str, str]]:
    """
    Collect non-2xx response schemas.

    Returns:
        key -> (status_code, schema_name)
    """
    shared_error_responses: dict[str, tuple[str, str]] = {}

    paths = spec.get(OPENAPI_PATHS, {})
    if not isinstance(paths, dict):
        return shared_error_responses

    for _path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue

        for method, operation in path_item.items():
            if method.lower() not in SUPPORTED_OPERATION_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            responses = operation.get(OPENAPI_RESPONSES, {})
            if not isinstance(responses, dict):
                continue

            for status_code, response in responses.items():
                if not isinstance(status_code, str):
                    continue

                if not isinstance(response, dict):
                    continue

                if is_success_status(status_code):
                    continue

                schema_ref = extract_schema_from_response(response, spec)
                if not schema_ref:
                    continue

                key = SDK_SHARED_ERROR_KEY_FORMAT.format(status_code, schema_ref)
                shared_error_responses[key] = (status_code, schema_ref)

    return shared_error_responses
