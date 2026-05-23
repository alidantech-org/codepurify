"""Tests for enum placement under models/{resource}/enums/."""

from constants.openapi_keys import OPENAPI_ENUM, OPENAPI_TYPE, OPENAPI_TYPE_STRING
from openapi.codegen_metadata import CODEGEN_KEY
from dart.classify.schemas import classify_schema
from dart.domain.kinds import SchemaKind
from dart.render.paths import enum_output_path


def test_enum_schema_classified_by_shape():
    """Test that root enum schema is classified as ENUM by shape."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        OPENAPI_ENUM: ["active", "suspended", "deleted"],
    }

    kind = classify_schema("UserStatus", schema)
    assert kind == SchemaKind.ENUM


def test_enum_shape_overrides_metadata_query():
    """Test that enum shape overrides metadata kind=query."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        OPENAPI_ENUM: ["admin", "user"],
        CODEGEN_KEY: {
            "kind": "query",
            "resource": "users",
        },
    }

    kind = classify_schema("UserRoles", schema)
    assert kind == SchemaKind.ENUM


def test_enum_shape_overrides_metadata_dto():
    """Test that enum shape overrides metadata kind=dto."""
    schema = {
        OPENAPI_TYPE: OPENAPI_TYPE_STRING,
        OPENAPI_ENUM: ["pending", "approved", "rejected"],
        CODEGEN_KEY: {
            "kind": "dto",
            "resource": "users",
        },
    }

    kind = classify_schema("UserRefsStatus", schema)
    assert kind == SchemaKind.ENUM


def test_enum_path_under_resource_enums():
    """Test that enum path is models/{resource}/enums/{enum_name}/enum.dart."""
    path = enum_output_path("user", "UserStatus")
    assert path.as_posix() == "models/user/enums/user_status/enum.dart"


def test_enum_path_uses_snake_case():
    """Test that enum folder name uses snake_case."""
    path = enum_output_path("user", "UserRoles")
    assert path.as_posix() == "models/user/enums/user_roles/enum.dart"


def test_enum_path_for_shared_resource():
    """Test that shared enums go under models/shared/enums/."""
    path = enum_output_path("shared", "CommonStatus")
    assert path.as_posix() == "models/shared/enums/common_status/enum.dart"
