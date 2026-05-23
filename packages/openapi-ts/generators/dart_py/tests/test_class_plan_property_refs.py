"""Integration tests for property ref resolution in class plans."""

from constants.openapi_keys import OPENAPI_PROPERTIES, OPENAPI_REF, OPENAPI_REQUIRED, OPENAPI_TYPE, OPENAPI_TYPE_STRING
from openapi.codegen_metadata import CODEGEN_KEY
from dart.domain.kinds import SchemaKind
from dart.planning.class_plan import build_class_plan
from dart.registry import build_schema_registry


def test_property_ref_resolved_in_class_plan():
    """Test that property refs are resolved to primitives in class plans."""
    spec = {
        "components": {
            "schemas": {
                # Property schema - should be inlined as String
                "BaseEntityId": {
                    OPENAPI_TYPE: OPENAPI_TYPE_STRING,
                    CODEGEN_KEY: {"kind": "property", "skip": True},
                },
                # Property schema - should be inlined as String
                "UserName": {
                    OPENAPI_TYPE: OPENAPI_TYPE_STRING,
                    CODEGEN_KEY: {"kind": "property", "skip": True},
                },
                # Model that uses property refs
                "UserPublic": {
                    OPENAPI_PROPERTIES: {
                        "id": {OPENAPI_REF: "#/components/schemas/BaseEntityId"},
                        "name": {OPENAPI_REF: "#/components/schemas/UserName"},
                    },
                    OPENAPI_REQUIRED: ["id", "name"],
                    CODEGEN_KEY: {
                        "kind": "model",
                        "entity": "user",
                        "model": "public",
                    },
                },
            }
        }
    }

    # Build registry
    symbol_registry = build_schema_registry(spec)

    # Verify property schemas are classified as SKIP
    assert symbol_registry["BaseEntityId"].kind == SchemaKind.SKIP
    assert symbol_registry["UserName"].kind == SchemaKind.SKIP
    assert symbol_registry["UserPublic"].kind == SchemaKind.MODEL

    # Build class plan for UserPublic
    schemas = spec["components"]["schemas"]
    user_public_schema = schemas["UserPublic"]
    user_public_symbol = symbol_registry["UserPublic"]

    class_plan = build_class_plan(
        schema_name="UserPublic",
        schema=user_public_schema,
        symbol=user_public_symbol,
        schemas=schemas,
        symbol_registry=symbol_registry,
        package_name="test_api",
    )

    # Verify field types are resolved to String, not property names
    field_types = {field.json_name: field.dart_type for field in class_plan.fields}

    assert field_types["id"] == "String", f"Expected String for id, got {field_types['id']}"
    assert field_types["name"] == "String", f"Expected String for name, got {field_types['name']}"

    # Verify no field type equals the property schema names
    for field in class_plan.fields:
        assert field.dart_type != "BaseEntityId", f"Field {field.json_name} has type BaseEntityId (should be String)"
        assert field.dart_type != "UserName", f"Field {field.json_name} has type UserName (should be String)"


def test_property_ref_with_enum_resolved_in_class_plan():
    """Test that property refs to enums are resolved correctly."""
    spec = {
        "components": {
            "schemas": {
                # Enum
                "UserStatus": {
                    OPENAPI_TYPE: OPENAPI_TYPE_STRING,
                    "enum": ["active", "suspended"],
                    CODEGEN_KEY: {"kind": "enum"},
                },
                # Property ref to enum - should be inlined as enum type
                "UserStatusProperty": {
                    OPENAPI_REF: "#/components/schemas/UserStatus",
                    CODEGEN_KEY: {"kind": "property", "skip": True},
                },
                # Model using property ref to enum
                "UserPublic": {
                    OPENAPI_PROPERTIES: {
                        "status": {OPENAPI_REF: "#/components/schemas/UserStatusProperty"},
                    },
                    OPENAPI_REQUIRED: ["status"],
                    CODEGEN_KEY: {
                        "kind": "model",
                        "entity": "user",
                        "model": "public",
                    },
                },
            }
        }
    }

    symbol_registry = build_schema_registry(spec)
    schemas = spec["components"]["schemas"]
    user_public_schema = schemas["UserPublic"]
    user_public_symbol = symbol_registry["UserPublic"]

    class_plan = build_class_plan(
        schema_name="UserPublic",
        schema=user_public_schema,
        symbol=user_public_symbol,
        schemas=schemas,
        symbol_registry=symbol_registry,
        package_name="test_api",
    )

    # Verify status field is resolved to UserStatus enum
    field_types = {field.json_name: field.dart_type for field in class_plan.fields}
    assert field_types["status"] == "UserStatus", f"Expected UserStatus for status, got {field_types['status']}"
    assert class_plan.fields[0].is_enum is True


def test_direct_enum_ref_still_works():
    """Test that direct enum refs (not through property) still work."""
    spec = {
        "components": {
            "schemas": {
                "UserStatus": {
                    OPENAPI_TYPE: OPENAPI_TYPE_STRING,
                    "enum": ["active", "suspended"],
                    CODEGEN_KEY: {"kind": "enum"},
                },
                "UserPublic": {
                    OPENAPI_PROPERTIES: {
                        "status": {OPENAPI_REF: "#/components/schemas/UserStatus"},
                    },
                    OPENAPI_REQUIRED: ["status"],
                    CODEGEN_KEY: {
                        "kind": "model",
                        "entity": "user",
                        "model": "public",
                    },
                },
            }
        }
    }

    symbol_registry = build_schema_registry(spec)
    schemas = spec["components"]["schemas"]
    user_public_schema = schemas["UserPublic"]
    user_public_symbol = symbol_registry["UserPublic"]

    class_plan = build_class_plan(
        schema_name="UserPublic",
        schema=user_public_schema,
        symbol=user_public_symbol,
        schemas=schemas,
        symbol_registry=symbol_registry,
        package_name="test_api",
    )

    field_types = {field.json_name: field.dart_type for field in class_plan.fields}
    assert field_types["status"] == "UserStatus"
    assert class_plan.fields[0].is_enum is True
