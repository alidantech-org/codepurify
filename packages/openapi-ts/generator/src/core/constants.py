from __future__ import annotations

APP_NAME = "OpenAPI Generator"
APP_COMMAND = "generator"

DEFAULT_CONFIG_FILE_NAMES = (
    "generator.config.yaml",
    "generator.config.yml",
    "generator.config.json",
)

OPENAPI_FILE_EXTENSIONS = (".yaml", ".yml", ".json")

X_CODEGEN = "x-codegen"
X_CODEGEN_RESOURCE = "resource"
X_CODEGEN_PARAMETERS = "parameters"
X_CODEGEN_REQUEST_BODY = "requestBody"
X_CODEGEN_RESPONSES = "responses"

REF_KEY = "$ref"
OPENAPI_KEY = "openapi"
INFO_KEY = "info"
TITLE_KEY = "title"
VERSION_KEY = "version"
PATHS_KEY = "paths"
COMPONENTS_KEY = "components"
SCHEMAS_KEY = "schemas"
RESPONSES_KEY = "responses"
REQUEST_BODIES_KEY = "requestBodies"
PARAMETERS_KEY = "parameters"

HTTP_METHODS = {
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
    "head",
    "trace",
}

JSON_POINTER_PREFIX = "#/"
COMPONENT_REF_PREFIX = "#/components/"

COMPONENT_SECTIONS = {
    "schemas",
    "responses",
    "requestBodies",
    "parameters",
    "headers",
    "examples",
    "securitySchemes",
}
