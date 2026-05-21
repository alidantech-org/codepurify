"""
OpenAPI schema key constants.

This module contains immutable constants for OpenAPI specification keys
used throughout the generator.

Keep all OpenAPI string keys here so parser/planner/resolver code does not
hard-code OpenAPI strings directly.
"""

# ---------------------------------------------------------------------------
# Root OpenAPI document keys
# ---------------------------------------------------------------------------

OPENAPI_VERSION = "openapi"
OPENAPI_INFO = "info"
OPENAPI_PATHS = "paths"
OPENAPI_COMPONENTS = "components"
OPENAPI_SECURITY = "security"
OPENAPI_TAGS = "tags"

# ---------------------------------------------------------------------------
# Components keys
# ---------------------------------------------------------------------------

OPENAPI_SCHEMAS = "schemas"
OPENAPI_PARAMETERS = "parameters"
OPENAPI_REQUEST_BODIES = "requestBodies"
OPENAPI_RESPONSES = "responses"

# ---------------------------------------------------------------------------
# Common metadata keys
# ---------------------------------------------------------------------------

OPENAPI_NAME = "name"
OPENAPI_TITLE = "title"
OPENAPI_SUMMARY = "summary"
OPENAPI_DESCRIPTION = "description"
OPENAPI_OPERATION_ID = "operationId"
OPENAPI_DEPRECATED = "deprecated"

# ---------------------------------------------------------------------------
# Schema keys
# ---------------------------------------------------------------------------

OPENAPI_REF = "$ref"
OPENAPI_SCHEMA = "schema"
OPENAPI_TYPE = "type"
OPENAPI_FORMAT = "format"
OPENAPI_ENUM = "enum"
OPENAPI_ITEMS = "items"
OPENAPI_PROPERTIES = "properties"
OPENAPI_ADDITIONAL_PROPERTIES = "additionalProperties"
OPENAPI_REQUIRED = "required"
OPENAPI_NULLABLE = "nullable"
OPENAPI_DEFAULT = "default"
OPENAPI_EXAMPLE = "example"
OPENAPI_EXAMPLES = "examples"

# Composition keys
OPENAPI_ANY_OF = "anyOf"
OPENAPI_ONE_OF = "oneOf"
OPENAPI_ALL_OF = "allOf"
OPENAPI_NOT = "not"

# Validation keys
OPENAPI_MIN_LENGTH = "minLength"
OPENAPI_MAX_LENGTH = "maxLength"
OPENAPI_MINIMUM = "minimum"
OPENAPI_MAXIMUM = "maximum"
OPENAPI_PATTERN = "pattern"
OPENAPI_MIN_ITEMS = "minItems"
OPENAPI_MAX_ITEMS = "maxItems"
OPENAPI_UNIQUE_ITEMS = "uniqueItems"

# ---------------------------------------------------------------------------
# OpenAPI primitive type values
# ---------------------------------------------------------------------------

OPENAPI_TYPE_ARRAY = "array"
OPENAPI_TYPE_NULL = "null"
OPENAPI_TYPE_BOOLEAN = "boolean"
OPENAPI_TYPE_INTEGER = "integer"
OPENAPI_TYPE_NUMBER = "number"
OPENAPI_TYPE_OBJECT = "object"
OPENAPI_TYPE_STRING = "string"

OPENAPI_PRIMITIVE_TYPES = frozenset(
    {
        OPENAPI_TYPE_NULL,
        OPENAPI_TYPE_BOOLEAN,
        OPENAPI_TYPE_INTEGER,
        OPENAPI_TYPE_NUMBER,
        OPENAPI_TYPE_OBJECT,
        OPENAPI_TYPE_STRING,
        OPENAPI_TYPE_ARRAY,
    }
)

# ---------------------------------------------------------------------------
# OpenAPI format values
# ---------------------------------------------------------------------------

OPENAPI_FORMAT_DATE = "date"
OPENAPI_FORMAT_DATE_TIME = "date-time"
OPENAPI_FORMAT_EMAIL = "email"
OPENAPI_FORMAT_URI = "uri"
OPENAPI_FORMAT_UUID = "uuid"
OPENAPI_FORMAT_BINARY = "binary"
OPENAPI_FORMAT_INT32 = "int32"
OPENAPI_FORMAT_INT64 = "int64"
OPENAPI_FORMAT_FLOAT = "float"
OPENAPI_FORMAT_DOUBLE = "double"

# ---------------------------------------------------------------------------
# Request/response keys
# ---------------------------------------------------------------------------

OPENAPI_REQUEST_BODY = "requestBody"
OPENAPI_CONTENT = "content"
OPENAPI_HEADERS = "headers"
OPENAPI_LINKS = "links"

# ---------------------------------------------------------------------------
# Parameter keys
# ---------------------------------------------------------------------------

OPENAPI_IN = "in"
OPENAPI_STYLE = "style"
OPENAPI_EXPLODE = "explode"
OPENAPI_ALLOW_RESERVED = "allowReserved"

# Parameter locations
PARAM_LOCATION_PATH = "path"
PARAM_LOCATION_QUERY = "query"
PARAM_LOCATION_HEADER = "header"
PARAM_LOCATION_COOKIE = "cookie"

PARAM_LOCATIONS = frozenset(
    {
        PARAM_LOCATION_PATH,
        PARAM_LOCATION_QUERY,
        PARAM_LOCATION_HEADER,
        PARAM_LOCATION_COOKIE,
    }
)

# ---------------------------------------------------------------------------
# OpenAPI reference prefixes
# ---------------------------------------------------------------------------

REF_PREFIX = "#/"
REF_PREFIX_COMPONENTS = "#/components/"
REF_PREFIX_COMPONENTS_PARAMETERS = "#/components/parameters/"
REF_PREFIX_COMPONENTS_SCHEMAS = "#/components/schemas/"
REF_PREFIX_COMPONENTS_REQUEST_BODIES = "#/components/requestBodies/"
REF_PREFIX_COMPONENTS_RESPONSES = "#/components/responses/"

# ---------------------------------------------------------------------------
# OpenAPI content/media types
# ---------------------------------------------------------------------------

CONTENT_TYPE_APPLICATION_JSON = "application/json"
CONTENT_TYPE_APPLICATION_JSON_UTF8 = "application/json; charset=utf-8"
CONTENT_TYPE_MULTIPART_FORM_DATA = "multipart/form-data"
CONTENT_TYPE_APPLICATION_FORM_URLENCODED = "application/x-www-form-urlencoded"
CONTENT_TYPE_TEXT_PLAIN = "text/plain"
CONTENT_TYPE_OCTET_STREAM = "application/octet-stream"

JSON_CONTENT_TYPES = frozenset(
    {
        CONTENT_TYPE_APPLICATION_JSON,
        CONTENT_TYPE_APPLICATION_JSON_UTF8,
    }
)

# ---------------------------------------------------------------------------
# HTTP methods
# ---------------------------------------------------------------------------

HTTP_METHOD_GET = "get"
HTTP_METHOD_POST = "post"
HTTP_METHOD_PUT = "put"
HTTP_METHOD_PATCH = "patch"
HTTP_METHOD_DELETE = "delete"
HTTP_METHOD_OPTIONS = "options"
HTTP_METHOD_HEAD = "head"
HTTP_METHOD_TRACE = "trace"

HTTP_METHODS = frozenset(
    {
        HTTP_METHOD_GET,
        HTTP_METHOD_POST,
        HTTP_METHOD_PUT,
        HTTP_METHOD_PATCH,
        HTTP_METHOD_DELETE,
        HTTP_METHOD_OPTIONS,
        HTTP_METHOD_HEAD,
        HTTP_METHOD_TRACE,
    }
)

SUPPORTED_OPERATION_METHODS = frozenset(
    {
        HTTP_METHOD_GET,
        HTTP_METHOD_POST,
        HTTP_METHOD_PUT,
        HTTP_METHOD_PATCH,
        HTTP_METHOD_DELETE,
    }
)

# ---------------------------------------------------------------------------
# Status codes
# ---------------------------------------------------------------------------

STATUS_CODE_OK = "200"
STATUS_CODE_CREATED = "201"
STATUS_CODE_ACCEPTED = "202"
STATUS_CODE_NO_CONTENT = "204"

STATUS_CODE_BAD_REQUEST = "400"
STATUS_CODE_UNAUTHORIZED = "401"
STATUS_CODE_FORBIDDEN = "403"
STATUS_CODE_NOT_FOUND = "404"
STATUS_CODE_CONFLICT = "409"
STATUS_CODE_UNPROCESSABLE_ENTITY = "422"
STATUS_CODE_INTERNAL_SERVER_ERROR = "500"

SUCCESS_STATUS_CODES = frozenset(
    {
        STATUS_CODE_OK,
        STATUS_CODE_CREATED,
        STATUS_CODE_ACCEPTED,
        STATUS_CODE_NO_CONTENT,
    }
)

ERROR_STATUS_CODES = frozenset(
    {
        STATUS_CODE_BAD_REQUEST,
        STATUS_CODE_UNAUTHORIZED,
        STATUS_CODE_FORBIDDEN,
        STATUS_CODE_NOT_FOUND,
        STATUS_CODE_CONFLICT,
        STATUS_CODE_UNPROCESSABLE_ENTITY,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
    }
)

# ---------------------------------------------------------------------------
# SDK/vendor extension keys
# ---------------------------------------------------------------------------

OPENAPI_EXTENSION_PREFIX = "x-"
OPENAPI_SDK_EXTENSION_PREFIX = "x-sdk-"

OPENAPI_X_SDK_SKIP = "x-sdk-skip"
OPENAPI_X_SDK_NAME = "x-sdk-name"
OPENAPI_X_SDK_GROUP = "x-sdk-group"
OPENAPI_X_SDK_KIND = "x-sdk-kind"
OPENAPI_X_SDK_USAGE = "x-sdk-usage"

OPENAPI_DEFAULT_RESPONSE = "default"

SUCCESS_STATUS_MIN = 200
SUCCESS_STATUS_MAX = 299

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def is_ref(value: object) -> bool:
    """Return true when a value is an OpenAPI local reference string."""
    return isinstance(value, str) and value.startswith(REF_PREFIX)


def is_schema_ref(value: object) -> bool:
    """Return true when a value references components.schemas."""
    return isinstance(value, str) and value.startswith(REF_PREFIX_COMPONENTS_SCHEMAS)


def is_parameter_ref(value: object) -> bool:
    """Return true when a value references components.parameters."""
    return isinstance(value, str) and value.startswith(REF_PREFIX_COMPONENTS_PARAMETERS)


def is_request_body_ref(value: object) -> bool:
    """Return true when a value references components.requestBodies."""
    return isinstance(value, str) and value.startswith(REF_PREFIX_COMPONENTS_REQUEST_BODIES)


def is_response_ref(value: object) -> bool:
    """Return true when a value references components.responses."""
    return isinstance(value, str) and value.startswith(REF_PREFIX_COMPONENTS_RESPONSES)


def get_ref_name(ref: str) -> str:
    """Extract the final component name from an OpenAPI reference."""
    return ref.rsplit("/", 1)[-1]


def is_http_method(value: str) -> bool:
    """Return true when a string is a valid OpenAPI path item HTTP method."""
    return value.lower() in HTTP_METHODS


def is_parameter_location(value: str) -> bool:
    """Return true when a string is a valid OpenAPI parameter location."""
    return value in PARAM_LOCATIONS


def is_success_status_code(status_code: str) -> bool:
    """Return true when a response status code is a 2xx success code."""
    return status_code.startswith("2")


def is_error_status_code(status_code: str) -> bool:
    """Return true when a response status code is not a 2xx success code."""
    return not is_success_status_code(status_code)


def is_json_content_type(content_type: str) -> bool:
    """Return true when a media type should be treated as JSON."""
    return content_type.lower() in JSON_CONTENT_TYPES
