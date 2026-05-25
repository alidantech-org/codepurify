"""File and folder constants."""

# Character encoding
ENCODING_UTF8 = "utf-8"

# Project folder names
DIR_SRC = "src"
DIR_TESTS = "tests"
DIR_TEMPLATES = "templates"
DIR_LANGUAGES = "languages"
DIR_GENERATOR = "generator"

# Output folder names
FOLDER_RESOURCES = "resources"
FOLDER_SCHEMAS = "schemas"
FOLDER_OPERATIONS = "operations"
FOLDER_OUTPUT = "output"

# Schema kind folder names
FOLDER_PRIMITIVE = "primitive"
FOLDER_ENUM = "enum"
FOLDER_MODEL = "model"
FOLDER_DTO = "dto"

# File names
FILE_SUMMARY = "summary.txt"
FILE_PYPROJECT = "pyproject.toml"

# File extensions
EXT_TEXT = ".txt"
EXT_JSON = ".json"
EXT_YAML = ".yaml"
EXT_YML = ".yml"

# Config file names
CONFIG_FILE_NAMES = (
    "generator.config.yaml",
    "generator.config.yml",
    "generator.config.json",
)

# OpenAPI file extensions
OPENAPI_EXTENSIONS = (EXT_YAML, EXT_YML, EXT_JSON)

# Error messages
ERR_PROJECT_ROOT_NOT_FOUND = "Could not find generator project root. Run from generator/ or from the repo root."

# Debug language constants
DEBUG_LANGUAGE = "debug"
DEBUG_FILE_EXTENSION = EXT_TEXT

# File name templates
TEMPLATE_RESOURCE_FILE = "{key}.txt"
TEMPLATE_SCHEMA_FILE = "{name}.txt"
TEMPLATE_OPERATION_FILE = "{operation_id}.txt"

# Table column names
COL_NAME = "Name"
COL_REF = "Ref"
COL_KIND = "Kind"
COL_RESOURCE = "Resource"
COL_KEY = "Key"
COL_PATH = "Path"
COL_OPERATIONS = "Operations"
COL_ALIAS_OF = "Alias Of"
COL_X_CODEGEN_KIND = "x-codegen Kind"
COL_KEYS = "Keys"
COL_LANGUAGE = "Language"
COL_FILES = "Files"
COL_CREATED = "Created"
COL_UPDATED = "Updated"
COL_UNCHANGED = "Unchanged"
COL_SKIPPED = "Skipped"
COL_OUTPUT = "Output"

# Table row labels
ROW_TITLE = "Title"
ROW_OPENAPI = "OpenAPI"
ROW_API_VERSION = "API Version"
ROW_PATHS = "Paths"
ROW_OPERATIONS = "Operations"
ROW_SCHEMAS = "Schemas"
ROW_RESPONSES = "Responses"
ROW_REQUEST_BODIES = "Request Bodies"
ROW_PARAMETERS = "Parameters"
ROW_REFS = "Refs"
ROW_COMPONENT_REFS = "Component Refs"
ROW_MISSING_COMPONENT_REFS = "Missing Component Refs"
ROW_RESOURCES = "Resources"
ROW_DEPENDENCIES = "Dependencies"
ROW_ALIAS_SCHEMAS = "Alias Schemas"
ROW_SCHEMA_KIND_PREFIX = "Kind: "

# Table titles
TITLE_OPENAPI_SUMMARY = "OpenAPI Summary"
TITLE_DETECTED_RESOURCES = "Detected Resources"
TITLE_INFERENCE_SUMMARY = "Inference Summary"
TITLE_UNKNOWN_SCHEMAS = "Unknown Schemas"
TITLE_ALIAS_SCHEMAS = "Alias Schemas"
TITLE_EMISSION_SUMMARY = "Emission Summary"

# Messages
MSG_UNKNOWN_SCHEMAS_DETECTED = "Unknown schemas detected"

# Renderer labels
LABEL_TITLE = "Title"
LABEL_OPENAPI = "OpenAPI"
LABEL_API_VERSION = "API Version"
LABEL_RESOURCES = "Resources"
LABEL_SCHEMAS = "Schemas"
LABEL_OPERATIONS = "Operations"
LABEL_DEPENDENCIES = "Dependencies"
LABEL_RESOURCE = "Resource"
LABEL_KEY = "Key"
LABEL_PATH = "Path"
LABEL_REF = "Ref"
LABEL_KIND = "Kind"
LABEL_X_CODEGEN = "x-codegen"
LABEL_IS_ALIAS = "Is Alias"
LABEL_ALIAS_OF = "Alias Of"
LABEL_OPERATION = "Operation"
LABEL_METHOD = "Method"
LABEL_PARAMETERS = "Parameters"
LABEL_REQUEST_BODY = "Request Body"
LABEL_RESPONSES = "Responses"
LABEL_SCHEMA_REFS = "All Schema Refs"
LABEL_DESCRIPTION = "Description"
LABEL_CONTENT_TYPES = "Content Types"
LABEL_REQUIRED = "Required"
LABEL_LOCATION = "location"
LABEL_STATUS_SUCCESS = "success"
LABEL_STATUS_ERROR = "error"
LABEL_STATUS_OTHER = "other"
LABEL_YES = "Yes"
LABEL_NO = "No"
LABEL_DASH = "-"

# Separator constants
SEPARATOR_PATH = "/"
SEPARATOR_COLON = ": "
SEPARATOR_COMMA = ", "
SEPARATOR_ARROW = " -> "
