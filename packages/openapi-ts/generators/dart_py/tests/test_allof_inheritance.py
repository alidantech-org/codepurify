"""Tests for allOf inheritance detection and planning."""

from pathlib import Path

from dart.type_system.schema_normalizer import get_effective_object_schema
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind
from dart.planning.class_plan import build_class_plan


def test_allof_detects_base_ref():
    """Test that allOf detects the first ref as base class."""
    schemas = {
        "BaseEntityPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "createdAt": {"type": "string"},
                "updatedAt": {"type": "string"},
            },
            "required": ["id", "createdAt", "updatedAt"],
        },
        "UserPublicModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                    },
                    "required": ["email"],
                },
            ],
        },
    }

    effective = get_effective_object_schema(schemas["UserPublicModel"], schemas)

    assert effective.base_schema_name == "BaseEntityPublicModel"
    assert effective.base_ref == "#/components/schemas/BaseEntityPublicModel"
    assert len(effective.base_properties) == 3
    assert "id" in effective.base_properties
    assert "createdAt" in effective.base_properties
    assert "updatedAt" in effective.base_properties


def test_base_class_name_resolves_correctly():
    """Test that base class name resolves from symbol registry."""
    schemas = {
        "BaseEntityPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
            },
            "required": ["id"],
        },
        "UserPublicModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                    },
                },
            ],
        },
    }

    symbol_registry = {
        "BaseEntityPublicModel": DartSymbol(
            schema_name="BaseEntityPublicModel",
            dart_name="BaseEntityPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/shared/base_entity_public/model.dart"),
        ),
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user_public/model.dart"),
        ),
    }

    plan = build_class_plan(
        schema_name="UserPublicModel",
        schema=schemas["UserPublicModel"],
        symbol=symbol_registry["UserPublicModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    assert plan.base_schema_name == "BaseEntityPublicModel"
    assert plan.base_class_name == "BaseEntityPublic"


def test_base_fields_separated_from_own_fields():
    """Test that base fields are separated from own fields."""
    schemas = {
        "BaseEntityPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "createdAt": {"type": "string"},
                "updatedAt": {"type": "string"},
            },
            "required": ["id", "createdAt", "updatedAt"],
        },
        "UserPublicModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                        "avatar": {"type": "string"},
                    },
                    "required": ["email"],
                },
            ],
        },
    }

    symbol_registry = {
        "BaseEntityPublicModel": DartSymbol(
            schema_name="BaseEntityPublicModel",
            dart_name="BaseEntityPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/shared/base_entity_public/model.dart"),
        ),
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user_public/model.dart"),
        ),
    }

    plan = build_class_plan(
        schema_name="UserPublicModel",
        schema=schemas["UserPublicModel"],
        symbol=symbol_registry["UserPublicModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    assert len(plan.base_fields) == 3
    assert len(plan.own_fields) == 3
    assert len(plan.fields) == 6  # Combined

    # Check base field names
    base_field_names = {f.json_name for f in plan.base_fields}
    assert base_field_names == {"id", "createdAt", "updatedAt"}

    # Check own field names
    own_field_names = {f.json_name for f in plan.own_fields}
    assert own_field_names == {"email", "phone", "avatar"}


def test_combined_fields_preserves_both():
    """Test that combined fields includes both base and own fields."""
    schemas = {
        "BaseEntityPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
            },
            "required": ["id"],
        },
        "UserPublicModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                    },
                },
            ],
        },
    }

    symbol_registry = {
        "BaseEntityPublicModel": DartSymbol(
            schema_name="BaseEntityPublicModel",
            dart_name="BaseEntityPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/shared/base_entity_public/model.dart"),
        ),
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user_public/model.dart"),
        ),
    }

    plan = build_class_plan(
        schema_name="UserPublicModel",
        schema=schemas["UserPublicModel"],
        symbol=symbol_registry["UserPublicModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    assert len(plan.fields) == 2
    field_names = {f.json_name for f in plan.fields}
    assert field_names == {"id", "email"}


def test_child_own_fields_no_duplicate_base_fields():
    """Test that child own fields do not duplicate base fields."""
    schemas = {
        "BaseEntityPublicModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "createdAt": {"type": "string"},
            },
            "required": ["id", "createdAt"],
        },
        "UserPublicModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseEntityPublicModel"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                    },
                },
            ],
        },
    }

    symbol_registry = {
        "BaseEntityPublicModel": DartSymbol(
            schema_name="BaseEntityPublicModel",
            dart_name="BaseEntityPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/shared/base_entity_public/model.dart"),
        ),
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user_public/model.dart"),
        ),
    }

    plan = build_class_plan(
        schema_name="UserPublicModel",
        schema=schemas["UserPublicModel"],
        symbol=symbol_registry["UserPublicModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # Own fields should not include base fields
    own_field_names = {f.json_name for f in plan.own_fields}
    assert "id" not in own_field_names
    assert "createdAt" not in own_field_names
    assert "email" in own_field_names


def test_no_base_class_when_no_allof():
    """Test that schemas without allOf have no base class."""
    schemas = {
        "SimpleModel": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
            },
        },
    }

    effective = get_effective_object_schema(schemas["SimpleModel"], schemas)

    assert effective.base_schema_name is None
    assert effective.base_ref is None
    assert len(effective.base_properties) == 0
    assert len(effective.own_properties) == 1


def test_direct_ref_treated_as_base():
    """Test that a direct $ref is treated as base class."""
    schemas = {
        "BaseModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
            },
        },
        "RefModel": {
            "$ref": "#/components/schemas/BaseModel",
        },
    }

    effective = get_effective_object_schema(schemas["RefModel"], schemas)

    assert effective.base_schema_name == "BaseModel"
    assert effective.base_ref == "#/components/schemas/BaseModel"
