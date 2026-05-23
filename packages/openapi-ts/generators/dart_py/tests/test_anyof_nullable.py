"""Tests for anyOf/nullable union type resolution."""

from pathlib import Path

from dart.type_system.schema_normalizer import unwrap_nullable_union
from dart.type_system.resolver import resolve_type
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind


def test_allof_string_null_resolves_to_nullable_string():
    """Test that anyOf string/null resolves to String?."""
    schema = {
        "anyOf": [
            {"type": "string"},
            {"type": "null"},
        ],
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    assert resolved.name == "String?"
    assert resolved.is_nullable is True
    assert resolved.base_name == "String"


def test_allof_ref_null_resolves_to_nullable_model():
    """Test that anyOf ref/null resolves to Model?."""
    schema = {
        "anyOf": [
            {"$ref": "#/components/schemas/UserPublicModel"},
            {"type": "null"},
        ],
    }

    symbol_registry = {
        "UserPublicModel": DartSymbol(
            schema_name="UserPublicModel",
            dart_name="UserPublic",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user_public/model.dart"),
        ),
    }
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    assert resolved.name == "UserPublic?"
    assert resolved.is_nullable is True
    assert resolved.base_name == "UserPublic"


def test_type_array_string_null_resolves_to_nullable_string():
    """Test that type [string, null] resolves to String?."""
    schema = {
        "type": ["string", "null"],
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    assert resolved.name == "String?"
    assert resolved.is_nullable is True
    assert resolved.base_name == "String"


def test_type_array_array_null_with_string_items_resolves_to_nullable_list():
    """Test that type [array, null] with string items resolves to List<String>?."""
    schema = {
        "type": ["array", "null"],
        "items": {"type": "string"},
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    # The array itself is nullable (required=False + schema_nullable=True)
    # Items are not nullable
    assert resolved.name == "List<String>?"
    assert resolved.is_nullable is True
    assert resolved.is_list is True
    assert resolved.base_name == "String"
    assert resolved.item_type is not None
    assert resolved.item_type.name == "String"  # Items should not be nullable


def test_array_with_nullable_string_items_resolves_to_nullable_item_list():
    """Test that array with nullable string items resolves to List<String?>? (optional field)."""
    schema = {
        "type": "array",
        "items": {
            "anyOf": [
                {"type": "string"},
                {"type": "null"},
            ],
        },
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    # Optional field (required=False) makes the list nullable
    # Items are also nullable from anyOf
    assert resolved.name == "List<String?>?"
    assert resolved.is_nullable is True  # Optional field
    assert resolved.is_list is True
    assert resolved.item_type is not None
    assert resolved.item_type.name == "String?"


def test_required_array_with_nullable_string_items_resolves_to_nullable_item_list():
    """Test that required array with nullable string items resolves to List<String?>."""
    schema = {
        "type": "array",
        "items": {
            "anyOf": [
                {"type": "string"},
                {"type": "null"},
            ],
        },
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=True,
    )

    assert resolved.name == "List<String?>"
    assert resolved.is_nullable is False  # Required field
    assert resolved.is_list is True
    assert resolved.item_type is not None
    assert resolved.item_type.name == "String?"


def test_multiple_non_null_allof_branches_fallback_to_object():
    """Test that multiple non-null anyOf branches fallback to Map<String, dynamic>?."""
    schema = {
        "anyOf": [
            {"type": "string"},
            {"type": "integer"},
            {"type": "null"},
        ],
    }

    symbol_registry = {}
    package_name = "test_package"

    resolved = resolve_type(
        schema=schema,
        symbol_registry=symbol_registry,
        package_name=package_name,
        required=False,
    )

    # Fallback for complex unions is Map<String, dynamic>? (free-form object)
    assert resolved.name == "Map<String, dynamic>?"
    assert resolved.is_nullable is True
    assert resolved.base_name == "Map<String, dynamic>"


def test_unwrap_nullable_union_simple():
    """Test unwrap_nullable_union with simple anyOf string/null."""
    schema = {
        "anyOf": [
            {"type": "string"},
            {"type": "null"},
        ],
    }

    normalized, is_nullable = unwrap_nullable_union(schema)

    assert is_nullable is True
    assert normalized == {"type": "string"}


def test_unwrap_nullable_union_type_array():
    """Test unwrap_nullable_union with type [string, null]."""
    schema = {
        "type": ["string", "null"],
    }

    normalized, is_nullable = unwrap_nullable_union(schema)

    assert is_nullable is True
    assert normalized == {"type": "string"}


def test_unwrap_nullable_union_non_nullable():
    """Test unwrap_nullable_union with non-nullable schema."""
    schema = {"type": "string"}

    normalized, is_nullable = unwrap_nullable_union(schema)

    assert is_nullable is False
    assert normalized == {"type": "string"}


def test_unwrap_nullable_union_complex_fallback():
    """Test unwrap_nullable_union with complex union fallback."""
    schema = {
        "anyOf": [
            {"type": "string"},
            {"type": "integer"},
            {"type": "null"},
        ],
    }

    normalized, is_nullable = unwrap_nullable_union(schema)

    assert is_nullable is True
    assert normalized == {"type": "object"}
