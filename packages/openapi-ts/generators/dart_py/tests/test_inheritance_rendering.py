"""Tests for inheritance rendering in class plans."""

from constants.openapi_keys import (
    OPENAPI_ALL_OF,
    OPENAPI_PROPERTIES,
    OPENAPI_REF,
    OPENAPI_REQUIRED,
    OPENAPI_TYPE,
    OPENAPI_TYPE_STRING,
)
from openapi.codegen_metadata import CODEGEN_KEY
from dart.planning.class_plan import build_class_plan
from dart.registry import build_schema_registry


def test_inheritance_separates_base_and_own_fields():
    """Test that base fields and own fields are separated in class plan."""
    spec = {
        "components": {
            "schemas": {
                # Base entity
                "BaseEntityPublic": {
                    OPENAPI_TYPE: "object",
                    OPENAPI_PROPERTIES: {
                        "id": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                        "createdAt": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                        "updatedAt": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                    },
                    OPENAPI_REQUIRED: ["id", "createdAt", "updatedAt"],
                    CODEGEN_KEY: {
                        "kind": "model",
                        "entity": "base_entity",
                        "model": "public",
                    },
                },
                # Child model
                "UserPublic": {
                    OPENAPI_TYPE: "object",
                    OPENAPI_ALL_OF: [
                        {OPENAPI_REF: "#/components/schemas/BaseEntityPublic"},
                        {
                            OPENAPI_TYPE: "object",
                            OPENAPI_PROPERTIES: {
                                "email": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                                "name": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                            },
                            OPENAPI_REQUIRED: ["email", "name"],
                        },
                    ],
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

    # Verify base class is set
    assert class_plan.base_class_name == "BaseEntityPublic"
    assert class_plan.base_schema_name == "BaseEntityPublic"

    # Verify base fields are separated
    base_field_names = {field.json_name for field in class_plan.base_fields}
    assert base_field_names == {"id", "createdAt", "updatedAt"}

    # Verify own fields are separated
    own_field_names = {field.json_name for field in class_plan.own_fields}
    assert own_field_names == {"email", "name"}

    # Verify render fields are only own fields (not base fields)
    render_field_names = {field.json_name for field in class_plan.render_fields}
    assert render_field_names == {"email", "name"}
    assert "id" not in render_field_names
    assert "createdAt" not in render_field_names
    assert "updatedAt" not in render_field_names


def test_render_fields_all_fields_when_no_base():
    """Test that render_fields includes all fields when there's no base class."""
    spec = {
        "components": {
            "schemas": {
                "UserPublic": {
                    OPENAPI_TYPE: "object",
                    OPENAPI_PROPERTIES: {
                        "id": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                        "email": {OPENAPI_TYPE: OPENAPI_TYPE_STRING},
                    },
                    OPENAPI_REQUIRED: ["id", "email"],
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

    # Verify no base class
    assert class_plan.base_class_name is None

    # Verify render_fields includes all fields
    render_field_names = {field.json_name for field in class_plan.render_fields}
    assert render_field_names == {"id", "email"}


def test_base_import_uri_uses_index_barrel():
    """Test that base class import uses index.dart barrel."""
    spec = {
        "components": {
            "schemas": {
                "BaseEntityPublic": {
                    OPENAPI_TYPE: "object",
                    OPENAPI_PROPERTIES: {"id": {OPENAPI_TYPE: OPENAPI_TYPE_STRING}},
                    CODEGEN_KEY: {
                        "kind": "model",
                        "entity": "base_entity",
                        "model": "public",
                    },
                },
                "UserPublic": {
                    OPENAPI_TYPE: "object",
                    OPENAPI_ALL_OF: [
                        {OPENAPI_REF: "#/components/schemas/BaseEntityPublic"},
                        {
                            OPENAPI_TYPE: "object",
                            OPENAPI_PROPERTIES: {"email": {OPENAPI_TYPE: OPENAPI_TYPE_STRING}},
                        },
                    ],
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

    # Verify base import uses index.dart
    assert class_plan.base_import_uri is not None
    assert class_plan.base_import_uri.endswith("/index.dart")
    assert not class_plan.base_import_uri.endswith("/model.dart")
