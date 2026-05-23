"""Tests for codegen consistency - constants, paths, imports, type resolution."""

from constants.dart_syntax import (
    DART_AS,
    DART_BOOL_TYPE,
    DART_INT_TYPE,
    DART_NUM_TYPE,
    DART_OPTIONAL_CHAIN,
    DART_STRING_TYPE,
)
from dart.render.paths import normalize_resource_folder, resolve_resource_folder
from dart.type_system.resolver import resolve_type
from openapi.codegen_metadata import CODEGEN_KEY, CodegenMetadata
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind


def test_normalize_resource_folder_singularizes():
    """Test that resource folder normalization singularizes names."""
    assert normalize_resource_folder("users") == "user"
    assert normalize_resource_folder("items") == "item"
    assert normalize_resource_folder("user") == "user"
    assert normalize_resource_folder("item") == "item"


def test_resolve_resource_folder_uses_x_codegen_resource():
    """Test that x-codegen.resource is the primary source."""
    meta = CodegenMetadata(resource="users", group="shared", entity=None, kind=None, component=None, skip=False, shared=False)
    assert resolve_resource_folder(meta) == "user"


def test_resolve_resource_folder_falls_back_to_group():
    """Test that x-codegen.group is used when resource is missing."""
    meta = CodegenMetadata(resource=None, group="users", entity=None, kind=None, component=None, skip=False, shared=False)
    assert resolve_resource_folder(meta) == "user"


def test_resolve_resource_folder_uses_fallback():
    """Test that fallback parameter is used when metadata is missing."""
    assert resolve_resource_folder(None, fallback="users") == "user"


def test_constants_are_used_in_json_expr():
    """Test that Dart syntax constants are defined and accessible."""
    assert DART_AS == "as"
    assert DART_STRING_TYPE == "String"
    assert DART_BOOL_TYPE == "bool"
    assert DART_INT_TYPE == "int"
    assert DART_NUM_TYPE == "num"
    assert DART_OPTIONAL_CHAIN == "?."


def test_property_ref_resolves_to_primitive():
    """Test that property refs resolve to primitives, not model types."""
    schemas = {
        "SharedPrimitivesMongoId": {
            "type": "string",
            CODEGEN_KEY: {
                "kind": "property",
                "skip": True,
            },
        },
    }

    symbol_registry = {
        "SharedPrimitivesMongoId": DartSymbol(
            schema_name="SharedPrimitivesMongoId",
            dart_name="SharedPrimitivesMongoId",
            kind=SchemaKind.SKIP,
            path=None,
        ),
    }

    from constants.openapi_keys import OPENAPI_REF
    field_schema = {OPENAPI_REF: "#/components/schemas/SharedPrimitivesMongoId"}

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    assert resolved.name == "String"
    assert resolved.is_primitive is True
    assert resolved.is_model is False


def test_enum_ref_resolves_to_enum_type():
    """Test that enum refs resolve to enum type, not model type."""
    schemas = {
        "UserStatus": {
            "type": "string",
            "enum": ["active", "suspended"],
            CODEGEN_KEY: {
                "kind": "enum",
                "entity": "User",
            },
        },
    }

    symbol_registry = {
        "UserStatus": DartSymbol(
            schema_name="UserStatus",
            dart_name="UserStatus",
            kind=SchemaKind.ENUM,
            path=None,
        ),
    }

    from constants.openapi_keys import OPENAPI_REF
    field_schema = {OPENAPI_REF: "#/components/schemas/UserStatus"}

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    assert resolved.name == "UserStatus"
    assert resolved.is_enum is True
    assert resolved.is_model is False


def test_array_enum_ref_resolves_to_list_enum():
    """Test that array of enum refs resolves to List<Enum>."""
    schemas = {
        "UserRoles": {
            "type": "string",
            "enum": ["admin", "user"],
            CODEGEN_KEY: {
                "kind": "enum",
                "entity": "User",
            },
        },
    }

    symbol_registry = {
        "UserRoles": DartSymbol(
            schema_name="UserRoles",
            dart_name="UserRoles",
            kind=SchemaKind.ENUM,
            path=None,
        ),
    }

    from constants.openapi_keys import OPENAPI_ITEMS, OPENAPI_REF, OPENAPI_TYPE_ARRAY
    field_schema = {
        "type": OPENAPI_TYPE_ARRAY,
        OPENAPI_ITEMS: {OPENAPI_REF: "#/components/schemas/UserRoles"},
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    assert resolved.name == "List<UserRoles>"
    assert resolved.is_list is True
    assert resolved.item_type is not None
    assert resolved.item_type.is_enum is True
