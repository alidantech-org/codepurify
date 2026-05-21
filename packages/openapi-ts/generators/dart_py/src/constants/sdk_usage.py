"""
SDK usage type constants.
"""

SDK_USAGE_MODEL = "model"
SDK_USAGE_DTO = "dto"
SDK_USAGE_SHARED = "shared"

SDK_USAGE_BODY = "body"
SDK_USAGE_QUERY = "query"
SDK_USAGE_PARAMS = "params"
SDK_USAGE_RESPONSE = "response"
SDK_USAGE_SHARED_ERROR = "shared_error"

SDK_USAGE_BODY_SHARED = "body/shared"
SDK_USAGE_RESPONSE_SHARED = "response/shared"
SDK_USAGE_PARAMS_SHARED = "params/shared"

SDK_OPERATION_DTO_USAGES = frozenset(
    {
        SDK_USAGE_BODY,
        SDK_USAGE_QUERY,
        SDK_USAGE_PARAMS,
        SDK_USAGE_RESPONSE,
    }
)

SDK_SHARED_ERROR_KEY_FORMAT = "{0}:{1}"

SDK_QUERY_SCHEMA_SUFFIX = "_query"
SDK_PARAMS_SCHEMA_SUFFIX = "_params"
SDK_BODY_SCHEMA_SUFFIX = "_body"
SDK_RESPONSE_SCHEMA_SUFFIX = "_response"
SDK_SHARED_ERROR_SCHEMA_PREFIX = "shared_error_"
