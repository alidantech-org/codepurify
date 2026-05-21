"""
SDK usage type planning.
"""

from constants.dart_syntax import (
    DART_LOCATION_PARAMETER,
    DART_LOCATION_REQUEST_BODY,
    DART_LOCATION_RESPONSE,
)
from constants.sdk_usage import (
    SDK_USAGE_BODY,
    SDK_USAGE_BODY_SHARED,
    SDK_USAGE_DTO,
    SDK_USAGE_MODEL,
    SDK_USAGE_PARAMS,
    SDK_USAGE_PARAMS_SHARED,
    SDK_USAGE_RESPONSE,
    SDK_USAGE_RESPONSE_SHARED,
    SDK_USAGE_SHARED,
)
from ...domain.kinds import SchemaKind
from ..operation_usage import SchemaUsage


def determine_usage_type(
    schema_usage: list[SchemaUsage],
    kind: SchemaKind,
) -> str:
    """Determine SDK usage type from schema usage and schema kind."""
    if not schema_usage:
        return SDK_USAGE_MODEL if kind == SchemaKind.MODEL else SDK_USAGE_DTO

    unique_operations = {usage.operation_id for usage in schema_usage}

    if len(unique_operations) > 1:
        locations = {usage.location for usage in schema_usage}

        if len(locations) == 1:
            location = next(iter(locations))

            if location == DART_LOCATION_REQUEST_BODY:
                return SDK_USAGE_BODY_SHARED

            if location == DART_LOCATION_RESPONSE:
                return SDK_USAGE_RESPONSE_SHARED

            if location == DART_LOCATION_PARAMETER:
                return SDK_USAGE_PARAMS_SHARED

        return SDK_USAGE_SHARED

    location = schema_usage[0].location

    if location == DART_LOCATION_REQUEST_BODY:
        return SDK_USAGE_BODY

    if location == DART_LOCATION_RESPONSE:
        return SDK_USAGE_RESPONSE

    if location == DART_LOCATION_PARAMETER:
        return SDK_USAGE_PARAMS

    return SDK_USAGE_MODEL if kind == SchemaKind.MODEL else SDK_USAGE_DTO
