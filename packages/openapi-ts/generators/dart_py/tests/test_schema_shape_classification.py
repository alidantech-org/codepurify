"""Tests for schema shape-based classification."""

from constants.openapi_keys import OPENAPI_ENUM, OPENAPI_PROPERTIES, OPENAPI_TYPE, OPENAPI_TYPE_OBJECT, OPENAPI_TYPE_STRING
from openapi.codegen_metadata import CODEGEN_KEY
from dart.classify.schemas import classify_schema, is_enum_schema, is_object_like_schema, is_property_schema
from dart.domain.kinds import SchemaKind


def test_is_enum_schema_detects_enum_values():
    """Test that is_enum_schema detects enum values."""
    schema = {OPENAPI_TYPE: OPENAPI_TYPE_STRING, OPENAPI_ENUM: ["active", "suspended"]}
    assert is_enum_schema(schema) is True


def test_is_enum_schema_false_without_enum():
    """Test that is_enum_schema returns False without enum values."""
    schema = {OPENAPI_TYPE: OPENAPI_TYPE_STRING}
    assert is_enum_schema(schema) is False


def test_is_object_like_schema_detects_properties():
    """Test that is_object_like_schema detects properties."""
    schema = {OPENAPI_TYPE: OPENAPI_TYPE_OBJECT, OPENAPI_PROPERTIES: {"id": {"type": "string"}}}
    assert is_object_like_schema(schema) is True


def test_is_object_like_schema_detects_object_type():
    """Test that is_object_like_schema detects object type."""
    schema = {OPENAPI_TYPE: OPENAPI_TYPE_OBJECT}
    assert is_object_like_schema(schema) is True


def test_is_property_schema_detects_metadata():
    """Test that is_property_schema detects x-codegen.kind=property."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        CODEGEN_KEY: {"kind": "property", "skip": True},
    }
    assert is_property_schema(schema) is True


def test_classify_enum_shape_overrides_metadata():
    """Test that enum shape overrides metadata kind=query."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        OPENAPI_ENUM: ["admin", "user"],
        CODEGEN_KEY: {"kind": "query"},
    }
    kind = classify_schema("UserRoles", schema)
    assert kind == SchemaKind.ENUM


def test_classify_enum_shape_overrides_dto_metadata():
    """Test that enum shape overrides metadata kind=dto."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        OPENAPI_ENUM: ["pending", "approved"],
        CODEGEN_KEY: {"kind": "dto"},
    }
    kind = classify_schema("ApprovalStatus", schema)
    assert kind == SchemaKind.ENUM


def test_classify_object_query_remains_query():
    """Test that object query schemas still generate query models."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_OBJECT,
        OPENAPI_PROPERTIES: {"name": {"type": "string"}},
        CODEGEN_KEY: {"kind": "query"},
    }
    kind = classify_schema("UserQueryExact", schema)
    assert kind == SchemaKind.QUERY


def test_classify_enum_field_inside_object_remains_field():
    """Test that enum fields inside query models remain fields, not classes."""
    # This is tested indirectly - the object schema is classified as MODEL/QUERY
    # The enum field inside it is resolved separately
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_OBJECT,
        OPENAPI_PROPERTIES: {"status": {OPENAPI_TYPE: OPENAPI_TYPE_STRING, OPENAPI_ENUM: ["active"]}},
        CODEGEN_KEY: {"kind": "query"},
    }
    kind = classify_schema("UserQueryExact", schema)
    assert kind == SchemaKind.QUERY
