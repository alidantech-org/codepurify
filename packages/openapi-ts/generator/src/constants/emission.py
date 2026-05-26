"""Emission template constants."""

# Template file extension
TEMPLATE_EXTENSION = ".j2"

# Path token patterns
TOKEN_SEGMENT_PREFIX = "["
TOKEN_SEGMENT_SUFFIX = "]"
TOKEN_SPREAD_PREFIX = "[..."
TOKEN_SPREAD_SUFFIX = "]"
TOKEN_INLINE_PREFIX = "("
TOKEN_INLINE_SUFFIX = ")"

# Token regex patterns
SEGMENT_PATTERN = r"^\[([a-zA-Z_][a-zA-Z0-9_.]*)\]$"
SPREAD_PATTERN = r"^\[\.\.\.([a-zA-Z_][a-zA-Z0-9_.]*)\]$"
INLINE_PATTERN = r"\(([a-zA-Z_][a-zA-Z0-9_.]*)\)"

# Combined variable pattern for descriptor
VARIABLE_PATTERN = r"\[\.\.\.([a-zA-Z_][a-zA-Z0-9_.]*)\]" r"|\[([a-zA-Z_][a-zA-Z0-9_.]*)\]" r"|\(([a-zA-Z_][a-zA-Z0-9_.]*)\)"

# Owner namespace prefixes for classification
OWNER_PREFIX_DTO = "dto."
OWNER_PREFIX_OPERATION = "operation."
OWNER_PREFIX_SCHEMA = "schema."
OWNER_PREFIX_RESOURCE = "resource."
OWNER_PREFIX_BARREL = "barrel."
OWNER_PREFIX_FIELD = "field."

# Owner priority order (higher priority first)
OWNER_PRIORITY_ORDER = (
    OWNER_PREFIX_DTO,
    OWNER_PREFIX_OPERATION,
    OWNER_PREFIX_SCHEMA,
    OWNER_PREFIX_RESOURCE,
    OWNER_PREFIX_BARREL,
    OWNER_PREFIX_FIELD,
)

# Template directory names
TEMPLATES_DIR = "templates"
DEBUG_TEMPLATES_DIR = "templates/debug"

# Debug template file names
EMIT_PLAN_TEMPLATE = "emit-plan.txt.j2"

# Default sample values for emit-plan command
SAMPLE_VERSION = "v1"
SAMPLE_PACKAGE_NAME = "riderescue_api"
SAMPLE_RESOURCE_USERS = "users"
SAMPLE_RESOURCE_VEHICLES = "vehicles"
SAMPLE_SCHEMA_USER_PROFILES = "UserProfiles"
SAMPLE_SCHEMA_VEHICLE = "Vehicle"
SAMPLE_OPERATION_CREATE_USER = "create_user"
SAMPLE_DTO_CREATE_USER_BODY = "CreateUserBody"
SAMPLE_DTO_ROLE_BODY = "body"
SAMPLE_OUTPUT_PARTS_MODELS = "models"
SAMPLE_OUTPUT_PARTS_DTOS = "dtos"
SAMPLE_OUTPUT_PARTS_USERS = "users"
SAMPLE_OUTPUT_PARTS_VEHICLES = "vehicles"
SAMPLE_OUTPUT_PARTS_CREATE_USER = "create_user"

# Context dictionary keys
KEY_PACKAGE = "package"
KEY_VERSION = "version"
KEY_RESOURCE = "resource"
KEY_SCHEMA = "schema"
KEY_NAME = "name"
KEY_OUTPUT = "output"
KEY_PARTS = "parts"
KEY_LANGUAGE = "language"
KEY_OPERATION = "operation"
KEY_DTO = "dto"
KEY_ROLE = "role"
