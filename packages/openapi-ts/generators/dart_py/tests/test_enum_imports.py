"""Tests for enum imports from symbol registry/plan path."""

from constants.openapi_keys import OPENAPI_REF
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind
from dart.type_system.resolver import resolve_type
from pathlib import Path


def test_enum_import_uri_from_symbol_path():
    """Test that enum import URI comes from symbol path, not hardcoded."""
    enum_symbol = DartSymbol(
        schema_name="UserStatus",
        dart_name="UserStatus",
        kind=SchemaKind.ENUM,
        path=Path("models/user/enums/user_status/enum.dart"),
    )

    symbol_registry = {"UserStatus": enum_symbol}

    field_schema = {OPENAPI_REF: "#/components/schemas/UserStatus"}

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="riderescue_api",
        required=True,
    )

    # Import URI should come from symbol path (using index.dart barrel with version prefix)
    assert resolved.import_uri == "package:riderescue_api/latest/models/user/enums/user_status/index.dart"


def test_enum_import_not_pointing_to_top_level_enums():
    """Test that enum imports do not point to lib/enums/."""
    enum_symbol = DartSymbol(
        schema_name="UserRoles",
        dart_name="UserRoles",
        kind=SchemaKind.ENUM,
        path=Path("models/user/enums/user_roles/enum.dart"),
    )

    symbol_registry = {"UserRoles": enum_symbol}

    field_schema = {OPENAPI_REF: "#/components/schemas/UserRoles"}

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="riderescue_api",
        required=True,
    )

    # Should not point to top-level enums
    assert resolved.import_uri is not None
    assert not resolved.import_uri.startswith("package:riderescue_api/enums/")
    assert resolved.import_uri.startswith("package:riderescue_api/latest/models/")


def test_enum_field_resolves_to_enum_type():
    """Test that enum field resolves to enum type, not model."""
    enum_symbol = DartSymbol(
        schema_name="UserStatus",
        dart_name="UserStatus",
        kind=SchemaKind.ENUM,
        path=Path("models/user/enums/user_status/enum.dart"),
    )

    symbol_registry = {"UserStatus": enum_symbol}

    field_schema = {OPENAPI_REF: "#/components/schemas/UserStatus"}

    resolved = resolve_type(
        schema=field_schema,
        symbol_registry=symbol_registry,
        package_name="riderescue_api",
        required=True,
    )

    assert resolved.name == "UserStatus"
    assert resolved.is_enum is True
    assert resolved.import_uri == "package:riderescue_api/latest/models/user/enums/user_status/index.dart"
