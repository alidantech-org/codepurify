"""Tests for property reference resolution to primitive Dart types."""

from constants.openapi_keys import OPENAPI_REF
from openapi.codegen_metadata import CODEGEN_KEY
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind
from dart.type_system.resolver import resolve_type


def test_property_ref_boolean_resolves_to_bool():
    """Test that a property ref to boolean resolves to bool type."""
    schemas = {
        "SharedPrimitivesSuccess": {
            "type": "boolean",
            CODEGEN_KEY: {
                "kind": "property",
                "skip": True,
            },
        },
    }

    symbol_registry = {
        "SharedPrimitivesSuccess": DartSymbol(
            schema_name="SharedPrimitivesSuccess",
            dart_name="SharedPrimitivesSuccess",
            kind=SchemaKind.SKIP,
            path=None,
        ),
    }

    # Field schema with $ref to property
    field_schema = {
        OPENAPI_REF: "#/components/schemas/SharedPrimitivesSuccess",
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    assert resolved.name == "bool"
    assert resolved.is_primitive is True
    assert resolved.is_model is False
    assert resolved.is_enum is False


def test_property_ref_string_resolves_to_string():
    """Test that a property ref to string resolves to String type."""
    schemas = {
        "SharedPrimitivesMessage": {
            "type": "string",
            CODEGEN_KEY: {
                "kind": "property",
                "skip": True,
            },
        },
    }

    symbol_registry = {
        "SharedPrimitivesMessage": DartSymbol(
            schema_name="SharedPrimitivesMessage",
            dart_name="SharedPrimitivesMessage",
            kind=SchemaKind.SKIP,
            path=None,
        ),
    }

    field_schema = {
        OPENAPI_REF: "#/components/schemas/SharedPrimitivesMessage",
    }

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


def test_property_ref_integer_resolves_to_int():
    """Test that a property ref to integer resolves to int type."""
    schemas = {
        "SharedPrimitivesPage": {
            "type": "integer",
            CODEGEN_KEY: {
                "kind": "property",
                "skip": True,
            },
        },
    }

    symbol_registry = {
        "SharedPrimitivesPage": DartSymbol(
            schema_name="SharedPrimitivesPage",
            dart_name="SharedPrimitivesPage",
            kind=SchemaKind.SKIP,
            path=None,
        ),
    }

    field_schema = {
        OPENAPI_REF: "#/components/schemas/SharedPrimitivesPage",
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    assert resolved.name == "int"
    assert resolved.is_primitive is True


def test_property_ref_enum_resolves_to_enum_type():
    """Test that a property ref to enum resolves to the enum type."""
    schemas = {
        "UserStatus": {
            "type": "string",
            "enum": ["active", "suspended", "deleted"],
            CODEGEN_KEY: {
                "kind": "enum",
                "entity": "User",
            },
        },
    }

    symbol_registry = {
        "UserStatus": DartSymbol(
            schema_name="UserStatus",
            dart_name="User",
            kind=SchemaKind.ENUM,
            path=None,
        ),
    }

    field_schema = {
        OPENAPI_REF: "#/components/schemas/UserStatus",
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    # Enum refs should still resolve to the enum type, not inlined
    assert resolved.name == "User"
    assert resolved.is_enum is True
    assert resolved.is_primitive is False


def test_non_property_ref_remains_as_ref():
    """Test that non-property refs (models/DTOs) are not inlined."""
    schemas = {
        "UserPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
            },
            CODEGEN_KEY: {
                "kind": "model",
                "entity": "User",
                "component": "UserPublic",
            },
        },
    }

    symbol_registry = {
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=None,
        ),
    }

    field_schema = {
        OPENAPI_REF: "#/components/schemas/UserPublicModel",
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=True,
        schemas=schemas,
    )

    # Model refs should remain as the model type
    assert resolved.name == "UserPublic"
    assert resolved.is_model is True
    assert resolved.is_primitive is False


def test_optional_property_ref_is_nullable():
    """Test that optional property refs are nullable."""
    schemas = {
        "SharedPrimitivesMessage": {
            "type": "string",
            CODEGEN_KEY: {
                "kind": "property",
                "skip": True,
            },
        },
    }

    symbol_registry = {
        "SharedPrimitivesMessage": DartSymbol(
            schema_name="SharedPrimitivesMessage",
            dart_name="SharedPrimitivesMessage",
            kind=SchemaKind.SKIP,
            path=None,
        ),
    }

    field_schema = {
        OPENAPI_REF: "#/components/schemas/SharedPrimitivesMessage",
    }

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="test_package",
        required=False,  # Optional field
        schemas=schemas,
    )

    assert resolved.name == "String?"
    assert resolved.is_nullable is True
