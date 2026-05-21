from pathlib import Path

PACKAGE_NAME = "riderescue_api"
GENERATOR_NAME = "dart-py"
GENERATOR_VERSION = "0.1.0"

DEFAULT_OPENAPI_INPUT = Path("../../openapi/openapi.yaml")
DEFAULT_DART_OUTPUT_DIR = Path("../../packages/dart/lib")
DEFAULT_DOCS_OUTPUT_DIR = Path("../../packages/dart/doc")

SUPPORTED_OPENAPI_EXTENSIONS = {".json", ".yaml", ".yml"}
TEMPLATE_DIR_NAME = "templates"

# Logging constants
LOG_FORMAT_MESSAGE = "%(message)s"
LOG_DATE_FORMAT = "[%X]"
LOG_LEVEL_DEBUG = "DEBUG"
LOG_LEVEL_INFO = "INFO"

# File encoding
FILE_ENCODING = "utf-8"

# CLI commands
CLI_COMMAND_GENERATE = "generate"
CLI_COMMAND_DOCS = "docs"
CLI_COMMAND_INSPECT = "inspect"
CLI_COMMAND_VERSION = "version"

# Doc operation keys
DOC_KEY_METHOD = "method"
DOC_KEY_PATH = "path"
DOC_KEY_OPERATION_ID = "operation_id"
DOC_KEY_SUMMARY = "summary"
DOC_KEY_DESCRIPTION = "description"
DOC_KEY_TAGS = "tags"
DOC_KEY_PARAMETERS = "parameters"
DOC_KEY_REQUEST_BODY = "request_body"
DOC_KEY_RESPONSES = "responses"
DOC_KEY_SECURITY = "security"

# Template context keys
TEMPLATE_CTX_INFO = "info"
TEMPLATE_CTX_OPENAPI_VERSION = "openapi_version"
TEMPLATE_CTX_TAGS = "tags"
TEMPLATE_CTX_OPERATION_COUNT = "operation_count"
TEMPLATE_CTX_SCHEMA_COUNT = "schema_count"
TEMPLATE_CTX_TAG = "tag"
TEMPLATE_CTX_OPERATIONS = "operations"
TEMPLATE_CTX_SCHEMAS = "schemas"

# Regex patterns for naming
REGEX_WORD_SEPARATOR = r"[_\-\s]+"
REGEX_CAMEL_TO_SNAKE = r"([a-z0-9])([A-Z])"
REGEX_NON_UNDERSCORE = r"[\-\s]+"
REGEX_MULTIPLE_UNDERSCORE = r"_+"

# Schema suffixes
IMPORTANT_SCHEMA_SUFFIXES = (
    "Body",
    "Request",
    "RequestBody",
    "Response",
    "Dto",
    "Model",
)

PRIMITIVE_FIELD_SUFFIXES = (
    "Field",
    "Param",
)

# Template names
TEMPLATE_DOCS_INDEX = "index.md.j2"
TEMPLATE_DOCS_TAG = "tag.md.j2"
TEMPLATE_DOCS_MODELS = "models.md.j2"

# Output file names
OUTPUT_FILE_INDEX = "index.md"
OUTPUT_FILE_MODELS = "models.md"

# Default tag
DEFAULT_TAG = "Default"

# Doc operation keys
DOC_KEY_METHOD = "method"
DOC_KEY_PATH = "path"
DOC_KEY_OPERATION_ID = "operation_id"
DOC_KEY_SUMMARY = "summary"
DOC_KEY_DESCRIPTION = "description"
DOC_KEY_TAGS = "tags"
DOC_KEY_PARAMETERS = "parameters"
DOC_KEY_REQUEST_BODY = "request_body"
DOC_KEY_RESPONSES = "responses"
DOC_KEY_SECURITY = "security"
