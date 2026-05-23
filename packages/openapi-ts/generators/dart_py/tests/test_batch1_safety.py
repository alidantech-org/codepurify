"""Tests for Batch 1 safety fixes: safe JSON helpers, required fields, inheritance."""

from pathlib import Path

from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind
from dart.planning.class_plan import build_class_plan
from dart.codegen.json_expr import build_from_json_expr
from dart.type_system.resolver import DartResolvedType


def test_inherited_class_disables_copywith():
    """Test that classes with base classes do not generate copyWith."""
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

    # Inherited class should generate copyWith with valid override (Batch 3 change)
    assert plan.generate_copy_with is True
    assert plan.has_copy_with_override is True
    # copyWith fields should include base fields + own fields
    assert len(plan.copy_with_fields) == 2  # id (base) + email (own)
    copy_with_field_names = {field.dart_name for field in plan.copy_with_fields}
    assert "id" in copy_with_field_names
    assert "email" in copy_with_field_names


def test_non_inherited_class_enables_copywith():
    """Test that classes without base classes generate copyWith."""
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
            path=Path("models/simple/model.dart"),
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

    # Non-inherited class should generate copyWith
    assert plan.generate_copy_with is True


def test_fromjson_uses_dartjson_string():
    """Test that fromJson uses DartJson.string for String types."""
    resolved = DartResolvedType(
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

    expr = build_from_json_expr("name", "name", "UserFields", resolved)
    assert "DartJson.string" in expr
    assert "as String" not in expr


def test_fromjson_uses_dartjson_nullable_string():
    """Test that fromJson uses DartJson.nullableString for nullable String types."""
    resolved = DartResolvedType(
        name="String?",
        base_name="String",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("name", "name", "UserFields", resolved)
    assert "DartJson.nullableString" in expr
    assert "as String?" not in expr


def test_fromjson_uses_dartjson_int():
    """Test that fromJson uses DartJson.intValue for int types."""
    resolved = DartResolvedType(
        name="int",
        base_name="int",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("page", "page", "QueryFields", resolved)
    assert "DartJson.intValue" in expr
    assert "as num" not in expr


def test_fromjson_uses_dartjson_datetime():
    """Test that fromJson uses DartJson.dateTime for DateTime types."""
    resolved = DartResolvedType(
        name="DateTime",
        base_name="DateTime",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("createdAt", "createdAt", "UserFields", resolved)
    assert "DartJson.dateTime" in expr
    assert "DateTime.parse" not in expr


def test_fromjson_uses_dartjson_list_string():
    """Test that fromJson uses DartJson.list for List<String> types."""
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

    resolved = DartResolvedType(
        name="List<String>",
        base_name="String",
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

    expr = build_from_json_expr("roles", "roles", "Fields", resolved)
    assert "DartJson.list" in expr
    assert "?? [].map" not in expr
    assert "as List?" not in expr


def test_fromjson_uses_dartjson_nullable_list():
    """Test that fromJson uses DartJson.nullableList for nullable list types."""
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

    resolved = DartResolvedType(
        name="List<String>?",
        base_name="String",
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

    expr = build_from_json_expr("roles", "roles", "Fields", resolved)
    assert "DartJson.nullableList" in expr
    assert "== null ? null" not in expr  # Should use DartJson.nullableList instead


def test_fromjson_uses_dartjson_asmap():
    """Test that fromJson uses DartJson.asMap for model types."""
    resolved = DartResolvedType(
        name="UserPublic",
        base_name="UserPublic",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=True,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_from_json_expr("user", "user", "Fields", resolved)
    assert "DartJson.asMap" in expr
    assert "Map<String, dynamic>.from" not in expr


def test_required_fields_from_own_required_array():
    """Test that required fields come from the own_required array, not base."""
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
                        "phone": {"type": "string"},
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

    # Check own fields required status
    own_field_required = {f.json_name: f.required for f in plan.own_fields}
    assert own_field_required.get("email") is True  # In own required
    assert own_field_required.get("phone") is False  # Not in own required

    # Check base fields required status
    base_field_required = {f.json_name: f.required for f in plan.base_fields}
    assert base_field_required.get("id") is True  # In base required
    assert base_field_required.get("createdAt") is True  # In base required


def test_allof_inheritance_keeps_base_fields_separate():
    """Test that allOf inheritance does not flatten base fields into child."""
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

    # Render fields should only include own fields when base class exists
    render_field_names = {f.json_name for f in plan.render_fields}
    assert "email" in render_field_names
    assert "id" not in render_field_names  # id is in base, not render_fields

    # Base fields should be separate
    base_field_names = {f.json_name for f in plan.base_fields}
    assert "id" in base_field_names
    assert "email" not in base_field_names


def test_class_imports_dartjson_helper():
    """Test that generated classes import the DartJson helper."""
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
            path=Path("models/simple/model.dart"),
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

    # Check that DartJson helper import is present
    import_uris = [imp.uri for imp in plan.imports]
    assert any("core/json/index.dart" in uri for uri in import_uris)
