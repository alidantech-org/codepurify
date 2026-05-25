"""HTTP protocol constants."""

# HTTP methods
METHOD_GET = "get"
METHOD_POST = "post"
METHOD_PUT = "put"
METHOD_PATCH = "patch"
METHOD_DELETE = "delete"
METHOD_OPTIONS = "options"
METHOD_HEAD = "head"
METHOD_TRACE = "trace"

HTTP_METHODS = {
    METHOD_GET,
    METHOD_POST,
    METHOD_PUT,
    METHOD_PATCH,
    METHOD_DELETE,
    METHOD_OPTIONS,
    METHOD_HEAD,
    METHOD_TRACE,
}

# Content types
CONTENT_JSON = "application/json"
CONTENT_FORM_DATA = "multipart/form-data"
CONTENT_TEXT = "text/plain"

# Status codes
STATUS_DEFAULT = "default"
STATUS_SUCCESS_MIN = 200
STATUS_SUCCESS_MAX = 299
STATUS_ERROR_MIN = 400

