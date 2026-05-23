"""Tests for Batch 4A: nested object model generation."""

from pathlib import Path

from dart.planning.class_plan import build_class_plan
from dart.planning.nested_object_planner import (
    plan_nested_object,
    get_nested_class_name,
    is_empty_object_schema,
    is_inline_object_schema,
    MAX_NESTING_DEPTH,
)
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol


def test_nested_object_emits_under_parent_folder():
    """Test that nested objects are planned under parent folder."""
    schemas = {
        "UserSettingsNotifications": {
            "type": "object",
            "properties": {
                "channels": {
                    "type": "object",
                    "x-codegen": {"name": "UserSettingsChannels"},
                    "properties": {
                        "email": {"type": "boolean"},
                        "sms": {"type": "boolean"},
                    },
                },
                "quietHours": {
                    "type": "object",
                    "x-codegen": {"name": "UserSettingsQuietHours"},
                    "properties": {
                        "start": {"type": "string"},
                        "end": {"type": "string"},
                    },
                },
            },
        },
    }

    symbol_registry = {
        "UserSettingsNotifications": DartSymbol(
            schema_name="UserSettingsNotifications",
            dart_name="UserSettingsNotifications",
            kind=SchemaKind.MODEL,
            path=Path("models/userSetting/user_settings_notifications/model.dart"),
        ),
    }

    build_class_plan(
        schema_name="UserSettingsNotifications",
        schema=schemas["UserSettingsNotifications"],
        symbol=symbol_registry["UserSettingsNotifications"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # Check that nested symbols were created
    assert "UserSettingsChannels" in symbol_registry
    assert "UserSettingsQuietHours" in symbol_registry

    # Check nested paths are under parent folder
    channels_symbol = symbol_registry["UserSettingsChannels"]
    quiet_hours_symbol = symbol_registry["UserSettingsQuietHours"]

    # Use Path comparison for cross-platform compatibility
    assert channels_symbol.path.is_relative_to(Path("models/userSetting/user_settings_notifications"))
    assert quiet_hours_symbol.path.is_relative_to(Path("models/userSetting/user_settings_notifications"))

    # Check they are NOT in models/nested/
    assert "nested" not in str(channels_symbol.path).lower()
    assert "nested" not in str(quiet_hours_symbol.path).lower()


def test_nested_class_names_use_openapi_name():
    """Test that nested class names use x-codegen.name when available."""
    schema = {
        "type": "object",
        "x-codegen": {"name": "UserSettingsChannels"},
        "properties": {
            "email": {"type": "boolean"},
        },
    }

    class_name = get_nested_class_name(schema, "channels", "UserSettingsNotifications")
    assert class_name == "UserSettingsChannels"


def test_nested_class_names_fallback_to_parent_field():
    """Test that nested class names fall back to parent + field name when no x-codegen.name."""
    schema = {
        "type": "object",
        "properties": {
            "email": {"type": "boolean"},
        },
    }

    class_name = get_nested_class_name(schema, "channels", "UserSettingsNotifications")
    assert class_name == "UserSettingsNotificationsChannels"


def test_empty_object_becomes_dynamic():
    """Test that empty object schemas return None from plan_nested_object."""
    schema = {
        "type": "object",
        "properties": {},
    }

    plan = plan_nested_object(
        schema=schema,
        json_name="metadata",
        parent_class_name="UserSettings",
        parent_artifact_folder=Path("models/userSetting/user_settings"),
        symbol_registry={},
        package_name="test_package",
    )

    assert plan is None


def test_is_empty_object_schema():
    """Test empty object detection."""
    assert is_empty_object_schema({"type": "object", "properties": {}}) is True
    assert is_empty_object_schema({"type": "object", "properties": {"name": {"type": "string"}}}) is False
    assert is_empty_object_schema({"type": "string"}) is False


def test_is_inline_object_schema():
    """Test inline object detection."""
    assert is_inline_object_schema({"type": "object", "properties": {"name": {"type": "string"}}}) is True
    assert is_inline_object_schema({"type": "object", "properties": {}}) is False
    assert is_inline_object_schema({"type": "string"}) is False
    assert is_inline_object_schema({"$ref": "#/components/schemas/User"}) is False


def test_max_nesting_depth():
    """Test that MAX_NESTING_DEPTH is set to 10."""
    assert MAX_NESTING_DEPTH == 10


def test_deep_nesting_support():
    """Test that nested objects are planned recursively."""
    schemas = {
        "Parent": {
            "type": "object",
            "properties": {
                "child": {
                    "type": "object",
                    "properties": {
                        "grandchild": {
                            "type": "object",
                            "properties": {
                                "value": {"type": "string"},
                            },
                        },
                    },
                },
            },
        },
    }

    symbol_registry = {
        "Parent": DartSymbol(
            schema_name="Parent",
            dart_name="Parent",
            kind=SchemaKind.MODEL,
            path=Path("models/parent/model.dart"),
        ),
    }

    build_class_plan(
        schema_name="Parent",
        schema=schemas["Parent"],
        symbol=symbol_registry["Parent"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # Should have created nested symbols for child and grandchild
    # The exact names depend on the naming logic, but we should have multiple nested symbols
    nested_symbols = [name for name in symbol_registry.keys() if name != "Parent"]
    assert len(nested_symbols) >= 2  # At least child and grandchild


def test_nested_class_name_sanitization():
    """Test that nested class names are sanitized for Dart."""
    from dart.planning.nested_object_planner import sanitize_class_name

    # Leading digit
    assert sanitize_class_name("12h") == "Value12h"

    # Reserved word
    assert sanitize_class_name("class") == "classValue"

    # Empty
    assert sanitize_class_name("") == "NestedObject"

    # Normal
    assert sanitize_class_name("UserSettingsChannels") == "UserSettingsChannels"
