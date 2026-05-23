"""Tests for Batch 3: inherited copyWith with valid override."""

from dart.planning.class_plan import build_class_plan
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from pathlib import Path


def test_inherited_copy_with_includes_base_params():
    """Test that inherited copyWith includes base class parameters."""
    schemas = {
        "BaseAbstract": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "createdAt": {"type": "string", "format": "date-time"},
                "updatedAt": {"type": "string", "format": "date-time"},
            },
            "required": ["id", "createdAt", "updatedAt"],
        },
        "User": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseAbstract"},
                {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string"},
                        "name": {"type": "string"},
                    },
                    "required": ["email", "name"],
                },
            ],
        },
    }

    symbol_registry = {
        "BaseAbstract": DartSymbol(
            schema_name="BaseAbstract",
            dart_name="BaseAbstract",
            kind=SchemaKind.MODEL,
            path=Path("models/shared/base_abstract/model.dart"),
        ),
        "User": DartSymbol(
            schema_name="User",
            dart_name="User",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user/model.dart"),
        ),
    }

    user_plan = build_class_plan(
        schema_name="User",
        schema=schemas["User"],
        symbol=symbol_registry["User"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # User should have copyWith enabled
    assert user_plan.generate_copy_with is True

    # User should have copyWith override flag set
    assert user_plan.has_copy_with_override is True

    # copyWith fields should include base fields + own fields
    assert len(user_plan.copy_with_fields) == 5  # 3 base + 2 own

    # Check base fields are in copyWith
    copy_with_field_names = {field.dart_name for field in user_plan.copy_with_fields}
    assert "id" in copy_with_field_names
    assert "createdAt" in copy_with_field_names
    assert "updatedAt" in copy_with_field_names

    # Check own fields are in copyWith
    assert "email" in copy_with_field_names
    assert "name" in copy_with_field_names


def test_non_inherited_copy_with_no_override():
    """Test that non-inherited copyWith has no override flag."""
    schemas = {
        "SimpleModel": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
            },
        },
    }

    symbol_registry = {
        "SimpleModel": DartSymbol(
            schema_name="SimpleModel",
            dart_name="SimpleModel",
            kind=SchemaKind.MODEL,
            path=Path("models/simple/simple_model/model.dart"),
        ),
    }

    plan = build_class_plan(
        schema_name="SimpleModel",
        schema=schemas["SimpleModel"],
        symbol=symbol_registry["SimpleModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # SimpleModel should have copyWith enabled
    assert plan.generate_copy_with is True

    # SimpleModel should NOT have copyWith override flag
    assert plan.has_copy_with_override is False

    # copyWith fields should only include own fields
    assert len(plan.copy_with_fields) == 1
    assert plan.copy_with_fields[0].dart_name == "name"


def test_copy_with_field_types_match_dart_types():
    """Test that copyWith parameter types match Dart field types."""
    schemas = {
        "BaseModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "count": {"type": "integer"},
            },
        },
        "ChildModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseModel"},
                {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "active": {"type": "boolean"},
                    },
                },
            ],
        },
    }

    symbol_registry = {
        "BaseModel": DartSymbol(
            schema_name="BaseModel",
            dart_name="BaseModel",
            kind=SchemaKind.MODEL,
            path=Path("models/base/base_model/model.dart"),
        ),
        "ChildModel": DartSymbol(
            schema_name="ChildModel",
            dart_name="ChildModel",
            kind=SchemaKind.MODEL,
            path=Path("models/child/child_model/model.dart"),
        ),
    }

    child_plan = build_class_plan(
        schema_name="ChildModel",
        schema=schemas["ChildModel"],
        symbol=symbol_registry["ChildModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # Check copyWith parameter types
    copy_with_types = {field.dart_name: field.copy_with_type for field in child_plan.copy_with_fields}

    # Base fields should have nullable types
    assert copy_with_types["id"] == "String?"
    assert copy_with_types["count"] == "int?"

    # Own fields should have nullable types
    assert copy_with_types["name"] == "String?"
    assert copy_with_types["active"] == "bool?"


def test_copy_with_fields_order_base_then_own():
    """Test that copyWith fields are ordered: base fields first, then own fields."""
    schemas = {
        "BaseModel": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "createdAt": {"type": "string", "format": "date-time"},
            },
        },
        "ChildModel": {
            "allOf": [
                {"$ref": "#/components/schemas/BaseModel"},
                {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                    },
                },
            ],
        },
    }

    symbol_registry = {
        "BaseModel": DartSymbol(
            schema_name="BaseModel",
            dart_name="BaseModel",
            kind=SchemaKind.MODEL,
            path=Path("models/base/base_model/model.dart"),
        ),
        "ChildModel": DartSymbol(
            schema_name="ChildModel",
            dart_name="ChildModel",
            kind=SchemaKind.MODEL,
            path=Path("models/child/child_model/model.dart"),
        ),
    }

    child_plan = build_class_plan(
        schema_name="ChildModel",
        schema=schemas["ChildModel"],
        symbol=symbol_registry["ChildModel"],
        symbol_registry=symbol_registry,
        package_name="test_package",
        schemas=schemas,
    )

    # Base fields should come first
    assert child_plan.copy_with_fields[0].dart_name == "id"
    assert child_plan.copy_with_fields[1].dart_name == "createdAt"

    # Own fields should come after
    assert child_plan.copy_with_fields[2].dart_name == "name"


def test_list_generic_types_in_from_json():
    """Test that list parsing includes explicit generic types."""
    from dart.codegen.json_expr import build_list_from_json_expr
    from dart.type_system.resolver import DartResolvedType

    # Create a resolved type for List<String>
    item_type = DartResolvedType(
        name="String",
        base_name="String",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    list_type = DartResolvedType(
        name="List<String>",
        base_name="List",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=True,
        is_enum=False,
        is_model=False,
        is_primitive=False,
        import_uri=None,
        item_type=item_type,
    )

    expr = build_list_from_json_expr("map[Fields.items]", list_type)

    # Should include explicit generic type
    assert "DartJson.list<String>" in expr
    assert "(item) => DartJson.string(item)" in expr


def test_nullable_list_generic_types_in_from_json():
    """Test that nullable list parsing includes explicit generic types."""
    from dart.codegen.json_expr import build_list_from_json_expr
    from dart.type_system.resolver import DartResolvedType

    # Create a resolved type for List<String>?
    item_type = DartResolvedType(
        name="String",
        base_name="String",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    list_type = DartResolvedType(
        name="List<String>?",
        base_name="List",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=True,
        is_enum=False,
        is_model=False,
        is_primitive=False,
        import_uri=None,
        item_type=item_type,
    )

    expr = build_list_from_json_expr("map[Fields.items]", list_type)

    # Should include explicit generic type
    assert "DartJson.nullableList<String>" in expr
    assert "(item) => DartJson.string(item)" in expr
