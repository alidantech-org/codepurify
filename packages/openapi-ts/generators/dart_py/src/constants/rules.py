"""
Generator policy constants and configuration.

This module contains naming patterns, prefixes, suffixes, and other constants
that drive generator behavior decisions like DTO detection and operation naming.

This module must not:
- contain business logic functions (move to rules/*.py if needed)
- perform OpenAPI traversal
- render templates
- write files
"""

PRIMITIVE_TYPES = {
    "string",
    "integer",
    "number",
    "boolean",
}

DTO_SUFFIXES = (
    "Body",
    "Request",
    "RequestBody",
    "Response",
    "Dto",
    "Payload",
    "Input",
    "Output",
    "Query",
    "Params",
)

PRIMITIVE_ALIAS_SUFFIXES = (
    "Field",
    "Param",
)

SHARED_DTO_NAMES = {
    "PaginationMeta",
    "ValidationErrors",
    "ValidationFieldErrorsMapField",
    "ValidationFormErrorsField",
}

SHARED_DTO_SUFFIXES = (
    "Meta",
    "Error",
    "Errors",
)

SUPPORT_SCHEMA_PATTERNS = (
    "Meta",
    "Pagination",
    "Validation",
    "Error",
    "Response",
    "Request",
    "Body",
)

DOMAIN_MODEL_EXCLUSIONS = {
    "User",
    "PublicUser",
    "PartialPublicUser",
    "GeoLocation",
}

MODEL_VARIANT_PREFIXES = (
    "PartialPublic",
    "PartialPrivate",
    "Partial",
    "Public",
    "Private",
    "Admin",
    "Full",
    "Compact",
    "Summary",
    "Detailed",
)

OPERATION_PREFIXES = (
    "Create",
    "Update",
    "Patch",
    "Delete",
    "Get",
    "List",
    "Search",
    "Resolve",
    "Login",
    "Signup",
    "Verify",
    "Reset",
    "Refresh",
    "Upload",
    "Download",
    "Assign",
    "Cancel",
    "Accept",
    "Reject",
    "Complete",
)
