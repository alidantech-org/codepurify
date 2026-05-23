from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from dart.type_system.resolver import resolve_type, is_nullable_schema_type
from pathlib import Path

from constants.dart_syntax import DART_NULLABLE_SUFFIX
from constants.dart_types import DART_BOOL, DART_DATE_TIME, DART_INT, DART_STRING
from constants.paths import DEFAULT_DART_PACKAGE_NAME


def test_resolves_string_field_to_string() -> None:
    schema = {"type": "string"}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == DART_STRING
    assert resolved.is_primitive
    assert not resolved.is_nullable
    assert not resolved.is_list


def test_resolves_date_time_field_to_datetime() -> None:
    schema = {"type": "string", "format": "date-time"}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == DART_DATE_TIME
    assert resolved.is_primitive
    assert not resolved.is_nullable


def test_resolves_integer_field_to_int() -> None:
    schema = {"type": "integer"}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == DART_INT
    assert resolved.is_primitive


def test_resolves_boolean_field_to_bool() -> None:
    schema = {"type": "boolean"}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == DART_BOOL
    assert resolved.is_primitive


def test_resolves_ref_to_primitive_alias() -> None:
    schema = {"$ref": "#/components/schemas/EmailField"}
    symbol_registry = {
        "EmailField": DartSymbol(
            schema_name="EmailField",
            dart_name=DART_STRING,
            kind=SchemaKind.PRIMITIVE_ALIAS,
            path=None,
        )
    }

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == DART_STRING
    assert resolved.is_primitive
    assert resolved.import_uri is None


def test_resolves_ref_to_enum() -> None:
    schema = {"$ref": "#/components/schemas/UserStatus"}
    symbol_registry = {
        "UserStatus": DartSymbol(
            schema_name="UserStatus",
            dart_name="UserStatus",
            kind=SchemaKind.ENUM,
            path=Path("enums/user/user_status.dart"),
        )
    }

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == "UserStatus"
    assert resolved.is_enum
    # Import now uses index.dart barrel with version prefix
    assert resolved.import_uri == f"package:{DEFAULT_DART_PACKAGE_NAME}/latest/enums/user/index.dart"


def test_resolves_ref_to_model() -> None:
    schema = {"$ref": "#/components/schemas/User"}
    symbol_registry = {
        "User": DartSymbol(
            schema_name="User",
            dart_name="User",
            kind=SchemaKind.MODEL,
            path=Path("models/user/user.dart"),
        )
    }

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == "User"
    assert resolved.is_model
    # Import now uses index.dart barrel with version prefix
    assert resolved.import_uri == f"package:{DEFAULT_DART_PACKAGE_NAME}/latest/models/user/index.dart"


def test_resolves_optional_field_as_nullable() -> None:
    schema = {"type": "string"}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=False)

    assert resolved.name == f"{DART_STRING}{DART_NULLABLE_SUFFIX}"
    assert resolved.is_nullable


def test_resolves_nullable_schema_as_nullable() -> None:
    schema = {"type": "string", "nullable": True}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == f"{DART_STRING}{DART_NULLABLE_SUFFIX}"
    assert resolved.is_nullable


def test_detects_nullable_anyof_with_null() -> None:
    schema = {
        "anyOf": [
            {"type": "string"},
            {"type": "null"},
        ]
    }

    assert is_nullable_schema_type(schema) is True


def test_resolves_array_of_primitives() -> None:
    schema = {"type": "array", "items": {"type": "string"}}
    symbol_registry = {}

    resolved = resolve_type(schema, symbol_registry, DEFAULT_DART_PACKAGE_NAME, required=True)

    assert resolved.name == f"List<{DART_STRING}>"
    assert resolved.is_list
    assert resolved.is_primitive
