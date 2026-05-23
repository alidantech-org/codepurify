"""Tests for Dart JSON expression builders."""

from dart.codegen.json_expr import (
    build_from_json_expr,
    build_to_json_expr,
)
from dart.type_system.resolver import DartResolvedType


def test_from_json_string_cast():
    """Test fromJson string cast."""
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
    assert expr == "map[UserFields.name] as String"


def test_from_json_nullable_string_cast():
    """Test fromJson nullable string cast."""
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
    assert expr == "map[UserFields.name] as String?"


def test_from_json_bool_cast():
    """Test fromJson bool cast."""
    resolved = DartResolvedType(
        name="bool",
        base_name="bool",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("success", "success", "ApiMessageFields", resolved)
    assert expr == "map[ApiMessageFields.success] as bool"


def test_from_json_int_num_to_int_conversion():
    """Test fromJson int num-to-int conversion."""
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
    assert expr == "(map[QueryFields.page] as num).toInt()"


def test_from_json_nullable_int_conversion():
    """Test fromJson nullable int conversion."""
    resolved = DartResolvedType(
        name="int?",
        base_name="int",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("page", "page", "QueryFields", resolved)
    assert expr == "(map[QueryFields.page] as num?)?.toInt()"


def test_from_json_double_conversion():
    """Test fromJson double conversion."""
    resolved = DartResolvedType(
        name="double",
        base_name="double",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=False,
        is_model=False,
        is_primitive=True,
        import_uri=None,
    )

    expr = build_from_json_expr("amount", "amount", "Fields", resolved)
    assert expr == "(map[Fields.amount] as num).toDouble()"


def test_from_json_enum_conversion():
    """Test fromJson enum conversion."""
    resolved = DartResolvedType(
        name="UserStatus",
        base_name="UserStatus",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=True,
        is_model=False,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_from_json_expr("status", "status", "UserFields", resolved)
    assert expr == "UserStatus.fromJson(map[UserFields.status])"


def test_from_json_nullable_enum_conversion():
    """Test fromJson nullable enum conversion."""
    resolved = DartResolvedType(
        name="UserStatus?",
        base_name="UserStatus",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=True,
        is_model=False,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_from_json_expr("status", "status", "UserFields", resolved)
    assert expr == "map[UserFields.status] == null ? null : UserStatus.fromJson(map[UserFields.status])"


def test_from_json_model_conversion():
    """Test fromJson model conversion."""
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
    assert "UserPublic.fromJson" in expr
    assert "Map<String, dynamic>" in expr


def test_from_json_nullable_model_conversion():
    """Test fromJson nullable model conversion."""
    resolved = DartResolvedType(
        name="UserPublic?",
        base_name="UserPublic",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=False,
        is_model=True,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_from_json_expr("user", "user", "Fields", resolved)
    assert expr == "map[Fields.user] == null ? null : UserPublic.fromJson(Map<String, dynamic>.from((map[Fields.user] as Map?) ?? {}))"


def test_from_json_list_string():
    """Test fromJson List<String>."""
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
    assert "as List?" in expr
    assert "as String" in expr
    assert ".map" in expr
    assert ".toList()" in expr


def test_from_json_nullable_list_string():
    """Test fromJson nullable List<String>."""
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
    assert "== null ? null" in expr
    assert "as List" in expr


def test_from_json_list_model():
    """Test fromJson List<Model>."""
    item_type = DartResolvedType(
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

    resolved = DartResolvedType(
        name="List<UserPublic>",
        base_name="UserPublic",
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

    expr = build_from_json_expr("items", "items", "Fields", resolved)
    assert "UserPublic.fromJson" in expr
    assert ".map" in expr
    assert ".toList()" in expr


def test_from_json_nullable_list_model():
    """Test fromJson nullable List<Model>."""
    item_type = DartResolvedType(
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

    resolved = DartResolvedType(
        name="List<UserPublic>?",
        base_name="UserPublic",
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

    expr = build_from_json_expr("items", "items", "Fields", resolved)
    assert "== null ? null" in expr
    assert "UserPublic.fromJson" in expr


def test_to_json_enum_calls_to_json():
    """Test toJson enum calls toJson()."""
    resolved = DartResolvedType(
        name="UserStatus",
        base_name="UserStatus",
        is_required=True,
        is_optional=False,
        is_nullable=False,
        is_list=False,
        is_enum=True,
        is_model=False,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_to_json_expr("status", "status", True, resolved)
    assert expr == "status.toJson()"


def test_to_json_nullable_enum_uses_question():
    """Test toJson nullable enum uses ?."""
    resolved = DartResolvedType(
        name="UserStatus?",
        base_name="UserStatus",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=True,
        is_model=False,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_to_json_expr("status", "status", False, resolved)
    assert expr == "status?.toJson()"


def test_to_json_model_calls_to_json():
    """Test toJson model calls toJson()."""
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

    expr = build_to_json_expr("user", "user", True, resolved)
    assert expr == "user.toJson()"


def test_to_json_nullable_model_uses_question():
    """Test toJson nullable model uses ?."""
    resolved = DartResolvedType(
        name="UserPublic?",
        base_name="UserPublic",
        is_required=False,
        is_optional=True,
        is_nullable=True,
        is_list=False,
        is_enum=False,
        is_model=True,
        is_primitive=False,
        import_uri=None,
    )

    expr = build_to_json_expr("user", "user", False, resolved)
    assert expr == "user?.toJson()"


def test_to_json_list_model_maps_to_json():
    """Test toJson list model maps toJson()."""
    item_type = DartResolvedType(
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

    resolved = DartResolvedType(
        name="List<UserPublic>",
        base_name="UserPublic",
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

    expr = build_to_json_expr("items", "items", True, resolved)
    assert ".map" in expr
    assert ".toJson()" in expr
    assert ".toList()" in expr
