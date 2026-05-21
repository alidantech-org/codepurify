"""
Dart syntax fragment constants.

This module contains immutable constants for Dart syntax fragments
used throughout the generator.

Keep Dart syntax strings here so generator expression builders and planners
do not hard-code Dart fragments directly.
"""

# ---------------------------------------------------------------------------
# Package/import formats
# ---------------------------------------------------------------------------

DART_PACKAGE_IMPORT_FORMAT = "package:{0}/{1}"
DART_PACKAGE_IMPORT_PATH_FORMAT = "package:{0}/{1}"
DART_PACKAGE_IMPORT_PREFIX = "package:"
DART_COLLECTION_IMPORT = "package:collection/collection.dart"

# ---------------------------------------------------------------------------
# Template file names
# ---------------------------------------------------------------------------

DART_TEMPLATE_ENUM = "enum.dart.j2"
DART_TEMPLATE_FIELDS = "fields.dart.j2"
DART_TEMPLATE_CLASS = "class.dart.j2"

# ---------------------------------------------------------------------------
# Fixed generated file names
# ---------------------------------------------------------------------------

MODEL_FILE_NAME = "model.dart"
FIELDS_FILE_NAME = "fields.dart"
INDEX_FILE_NAME = "index.dart"
ENUM_FILE_NAME = "enum.dart"

BODY_FILE_NAME = "body.dart"
QUERY_FILE_NAME = "query.dart"
PARAMS_FILE_NAME = "params.dart"
RESPONSE_FILE_NAME = "response.dart"

# Aliases used by newer planner code
DART_MODEL_FILE_NAME = MODEL_FILE_NAME
DART_FIELDS_FILE_NAME = FIELDS_FILE_NAME
DART_INDEX_FILE_NAME = INDEX_FILE_NAME
DART_ENUM_FILE_NAME = ENUM_FILE_NAME

# Barrel export file names
DART_EXPORT_MODEL = MODEL_FILE_NAME
DART_EXPORT_FIELDS = FIELDS_FILE_NAME
DART_EXPORT_ENUM = ENUM_FILE_NAME

# ---------------------------------------------------------------------------
# Root folders / generated package folders
# ---------------------------------------------------------------------------

DART_MODELS_FOLDER = "models"
DART_DTOS_FOLDER = "dtos"
DART_ENUMS_FOLDER = "enums"
DART_FEATURES_ROOT = "features"
DART_ROUTES_ROOT = "routes"
DART_SHARED_FOLDER = "shared"

# Optional aliases if some files use *_ROOT naming
DART_MODELS_ROOT = DART_MODELS_FOLDER
DART_DTOS_ROOT = DART_DTOS_FOLDER
DART_ENUMS_ROOT = DART_ENUMS_FOLDER

# ---------------------------------------------------------------------------
# Path/string format helpers
# ---------------------------------------------------------------------------

DART_PATH_SEPARATOR = "/"
DART_WINDOWS_PATH_SEPARATOR = "\\"
DART_FILE_EXTENSION = ".dart"

DART_FILE_NAME_FORMAT = "{0}{1}"
DART_FILE_NAME_WITH_SUFFIX_FORMAT = "{0}{1}{2}"

DART_ROUTE_IMPORT_FORMAT = "{0}/{1}"
DART_RESPONSE_FOLDER_PREFIX = "response_"

DART_PATH_FORMAT_DOMAIN_FIELDS = "{0}/{1}/{1}{2}{3}"
DART_PATH_FORMAT_SDK_GROUP_FIELDS = "{0}/{1}/{2}{3}{4}"
DART_PATH_FORMAT_OPERATION_FIELDS = "{0}/{1}/{1}{2}{3}"

# ---------------------------------------------------------------------------
# Default generation values
# ---------------------------------------------------------------------------

DART_DEFAULT_SOURCE_FILE = "OpenAPI spec"
DART_DEFAULT_VERSION_NAME = "v1"
DART_DEFAULT_TAG = "default"
DART_FILE_ENCODING = "utf-8"

# ---------------------------------------------------------------------------
# Log messages
# ---------------------------------------------------------------------------

DART_LOG_DRY_RUN_PREFIX = "[DRY RUN] Would write: "
DART_LOG_CONTENT_PREFIX = "Content:"
DART_LOG_WROTE_PREFIX = "Wrote: "

# ---------------------------------------------------------------------------
# Template context keys
# ---------------------------------------------------------------------------

DART_CONTEXT_KEY_PLAN = "plan"
DART_CONTEXT_KEY_GENERATED_AT = "generated_at"
DART_CONTEXT_KEY_SOURCE_FILE = "source_file"
DART_CONTEXT_KEY_OUTPUT_PATH = "output_path"

# ---------------------------------------------------------------------------
# Suffixes/class naming
# ---------------------------------------------------------------------------

DART_PARAMS_SUFFIX = "_params"
DART_FIELDS_SUFFIX = "_fields"
DART_FIELDS_CLASS_SUFFIX = "Fields"
DART_PARAMS_CLASS_SUFFIX = "Params"
DART_VALUE_SUFFIX = "Value"

# ---------------------------------------------------------------------------
# Schema usage location constants
# ---------------------------------------------------------------------------

DART_LOCATION_REQUEST_BODY = "request_body"
DART_LOCATION_RESPONSE = "response"
DART_LOCATION_PARAMETER = "parameter"

# ---------------------------------------------------------------------------
# Dart tokens
# ---------------------------------------------------------------------------

DART_NULL = "null"
DART_TRUE = "true"
DART_FALSE = "false"
DART_EMPTY_STRING = '""'
DART_NULLABLE_SUFFIX = "?"
DART_REDACTED_VALUE = "***"

# ---------------------------------------------------------------------------
# Dart variable names used in generated expressions
# ---------------------------------------------------------------------------

DART_JSON_MAP_VAR = "map"
DART_JSON_INPUT_VAR = "json"
DART_LAMBDA_ITEM_VAR = "item"

# ---------------------------------------------------------------------------
# Dart method/property names
# ---------------------------------------------------------------------------

DART_FROM_JSON_METHOD = "fromJson"
DART_FROM_VALUE_METHOD = "fromValue"
DART_TO_JSON_METHOD = "toJson"
DART_TO_STRING_METHOD = "toString"
DART_TO_ISO_8601_STRING = "toIso8601String"
DART_PARSE_DATE_TIME = "DateTime.parse"
DART_ENUM_VALUE_PROPERTY = "value"

# ---------------------------------------------------------------------------
# Dart type name constants
# ---------------------------------------------------------------------------

DART_DATETIME_TYPE = "DateTime"
DART_STRING_TYPE = "String"
DART_BOOL_TYPE = "bool"
DART_INT_TYPE = "int"
DART_DOUBLE_TYPE = "double"
DART_NUM_TYPE = "num"
DART_DYNAMIC_TYPE = "dynamic"
DART_OBJECT_TYPE = "Object"
DART_MAP_STRING_DYNAMIC_TYPE = "Map<String, dynamic>"
DART_LIST_DYNAMIC_TYPE = "List<dynamic>"
DART_LIST_DYNAMIC_NULLABLE_TYPE = "List<dynamic>?"

DART_LIST_TYPE_FORMAT = "List<{0}>"
DART_STRING_PARAM_FORMAT = "String {0}"

# ---------------------------------------------------------------------------
# Dart SDK/API request helpers
# ---------------------------------------------------------------------------

DART_REQUEST_FALLBACK_CLASS = "Request"

DART_BODY_TO_JSON_EXPR = "body.toJson()"
DART_QUERY_TO_JSON_EXPR = "query?.toJson()"
DART_PARAMS_EXPR = "params"

DART_ENDPOINT_PARAM_ACCESS_FORMAT = "params.{0}"

DART_FUTURE_API_RESULT_FORMAT = "Future<ApiResult<{0}>>"
DART_METHOD_NO_ARGS_FORMAT = "{0} {1}()"

# ---------------------------------------------------------------------------
# Generic expression format constants
# ---------------------------------------------------------------------------

DART_EXPR_VALUE = "{0}.{1}"
DART_EXPR_NULLABLE_VALUE = "{0}?.{1}"
DART_EXPR_METHOD_CALL = "{0}.{1}()"
DART_EXPR_NULLABLE_METHOD_CALL = "{0}?.{1}()"
DART_EXPR_STATIC_METHOD_CALL = "{0}.{1}({2})"
DART_EXPR_TOP_LEVEL_CALL = "{0}({1})"

DART_EXPR_NULL_CHECK = "{0} == null"
DART_EXPR_NOT_NULL_CHECK = "{0} != null"
DART_EXPR_TERNARY = "{0} ? {1} : {2}"
DART_EXPR_NULLABLE_CHAIN = "{0} == null ? null : {1}"

DART_EXPR_AS_CAST = "{0} as {1}"
DART_EXPR_NULLABLE_AS_CAST = "{0} as {1}?"
DART_EXPR_MAP_CAST = "{0} as Map<String, dynamic>"
DART_EXPR_LIST_CAST = "{0} as List<dynamic>"
DART_EXPR_NULLABLE_LIST_CAST = "{0} as List<dynamic>?"

DART_EXPR_MAP_ITEM = "{0}[{1}]"
DART_EXPR_FIELD_ACCESS = "{0}.{1}"

DART_EXPR_TO_STRING = "{0}.toString()"
DART_EXPR_NULLABLE_TO_STRING = "{0}?.toString()"
DART_EXPR_TO_ISO_8601 = "{0}.toIso8601String()"

DART_EXPR_BOOL_TRUE_CHECK = "{0} == true"

DART_EXPR_LIST_OR_EMPTY = "(({0} as List?) ?? [])"
# DART_EXPR_MAP_CALL = "{0}.map(({1}) => {2}).toList()"
DART_EXPR_MAP_CALL = "{0}.map(({1}) => {2}).toList()"
# DART_EXPR_NULLABLE_MAP_CALL = "{0}?.map(({1}) => {2}).toList()"
DART_EXPR_NULLABLE_MAP_CALL = "{0}.map(({1}) => {2}).toList()"
DART_EXPR_ITEM_PROPERTY = "{0}.{1}"
DART_EXPR_ITEM_METHOD_CALL = "{0}.{1}()"
DART_EXPR_ITEM_CAST = "{0} as {1}"

DART_EXPR_TO_LIST = "{0}?.toList()"
DART_EXPR_TO_LIST_NONNULL = "{0}.toList()"

DART_MAP_TYPE_PREFIX = "Map<"
DART_MAP_STRING_TYPE_FORMAT = "Map<String, {0}>"

# ---------------------------------------------------------------------------
# JSON fromJson composed expression formats
# ---------------------------------------------------------------------------

DART_EXPR_FROM_JSON_FIELD_VALUE = "{0}[{1}.{2}]"

DART_EXPR_REQUIRED_STRING_FROM_JSON = '{0}?.toString() ?? ""'
DART_EXPR_NULLABLE_STRING_FROM_JSON = "{0}?.toString()"

DART_EXPR_REQUIRED_DATETIME_FROM_JSON = "DateTime.parse({0}.toString())"
DART_EXPR_NULLABLE_DATETIME_FROM_JSON = "{0} == null ? null : DateTime.parse({0}.toString())"

DART_EXPR_REQUIRED_ENUM_FROM_JSON = "{0}.fromValue({1}?.toString())"
DART_EXPR_NULLABLE_ENUM_FROM_JSON = "{1} == null ? null : {0}.fromValue({1}?.toString())"

DART_EXPR_REQUIRED_MODEL_FROM_JSON = "{0}.fromJson({1} as Map<String, dynamic>)"
DART_EXPR_NULLABLE_MODEL_FROM_JSON = "{1} == null ? null : {0}.fromJson({1} as Map<String, dynamic>)"

DART_EXPR_REQUIRED_INT_FROM_JSON = "{0} is int ? {0} : int.parse({0}.toString())"
DART_EXPR_NULLABLE_INT_FROM_JSON = "{0} == null ? null : ({0} is int ? {0} : int.parse({0}.toString()))"

DART_EXPR_REQUIRED_DOUBLE_FROM_JSON = "{0} is double ? {0} : double.parse({0}.toString())"
DART_EXPR_NULLABLE_DOUBLE_FROM_JSON = "{0} == null ? null : ({0} is double ? {0} : double.parse({0}.toString()))"

DART_EXPR_REQUIRED_NUM_FROM_JSON = "{0} is num ? {0} : num.parse({0}.toString())"
DART_EXPR_NULLABLE_NUM_FROM_JSON = "{0} == null ? null : ({0} is num ? {0} : num.parse({0}.toString()))"

DART_EXPR_REQUIRED_BOOL_FROM_JSON = "{0} == true"
DART_EXPR_NULLABLE_BOOL_FROM_JSON = "{0} == null ? null : {0} == true"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def format_package_import(package_name: str, file_path: str) -> str:
    """Format a Dart package import URI."""
    return DART_PACKAGE_IMPORT_FORMAT.format(package_name, file_path)


def normalize_dart_path(path: object) -> str:
    """Normalize a filesystem path to a Dart import/export path."""
    return str(path).replace(DART_WINDOWS_PATH_SEPARATOR, DART_PATH_SEPARATOR)
