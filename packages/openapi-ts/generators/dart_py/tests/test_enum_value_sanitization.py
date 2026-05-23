"""Tests for enum value sanitization to ensure valid Dart identifiers."""

from dart.planning.enum_plan import to_enum_value_name, build_enum_plan
from dart.registry import DartSymbol
from dart.domain.kinds import SchemaKind
from pathlib import Path


def test_enum_value_starting_with_digit():
    """Test that enum values starting with digits are prefixed with 'value'."""
    assert to_enum_value_name("12h") == "value12h"
    assert to_enum_value_name("24h") == "value24h"
    assert to_enum_value_name("1") == "value1"
    assert to_enum_value_name("123") == "value123"


def test_enum_value_starting_with_plus():
    """Test that enum values starting with + are prefixed with 'plus'."""
    assert to_enum_value_name("+numberPlate") == "plusNumberPlate"
    assert to_enum_value_name("+") == "plus"


def test_enum_value_starting_with_minus():
    """Test that enum values starting with - are prefixed with 'minus'."""
    assert to_enum_value_name("-numberPlate") == "minusNumberPlate"
    assert to_enum_value_name("-") == "minus"


def test_enum_value_reserved_words():
    """Test that Dart reserved words are suffixed with 'Value'."""
    assert to_enum_value_name("default") == "defaultValue"
    assert to_enum_value_name("class") == "classValue"
    assert to_enum_value_name("true") == "trueValue"
    assert to_enum_value_name("false") == "falseValue"
    assert to_enum_value_name("null") == "nullValue"
    assert to_enum_value_name("if") == "ifValue"
    assert to_enum_value_name("for") == "forValue"


def test_enum_value_empty_string():
    """Test that empty string becomes 'unknownValue'."""
    assert to_enum_value_name("") == "unknownValue"


def test_enum_value_normal_names():
    """Test that normal enum values are preserved."""
    assert to_enum_value_name("name") == "name"
    assert to_enum_value_name("active") == "active"
    assert to_enum_value_name("inactive") == "inactive"
    assert to_enum_value_name("userStatus") == "userStatus"


def test_enum_value_with_hyphens():
    """Test that hyphens are handled by camelCase conversion."""
    assert to_enum_value_name("user-name") == "userName"
    assert to_enum_value_name("time-format") == "timeFormat"


def test_enum_value_duplicate_handling():
    """Test that duplicate sanitized names are made unique."""
    schema = {
        "type": "string",
        "enum": ["1-value", "1_value"],
    }

    symbol = DartSymbol(
        schema_name="TestEnum",
        dart_name="TestEnum",
        kind=SchemaKind.ENUM,
        path=Path("models/test/test_enum/enum.dart"),
    )

    plan = build_enum_plan("TestEnum", schema, symbol)

    # Both should sanitize to "value1Value" initially, but second gets a number
    dart_names = [value.dart_name for value in plan.values]
    assert "value1Value" in dart_names
    assert "value1Value2" in dart_names
    assert len(dart_names) == 2


def test_enum_plan_preserves_wire_values():
    """Test that wire values are preserved unchanged."""
    schema = {
        "type": "string",
        "enum": ["12h", "24h", "+numberPlate", "-numberPlate"],
    }

    symbol = DartSymbol(
        schema_name="TestEnum",
        dart_name="TestEnum",
        kind=SchemaKind.ENUM,
        path=Path("models/test/test_enum/enum.dart"),
    )

    plan = build_enum_plan("TestEnum", schema, symbol)

    wire_values = [value.wire_value for value in plan.values]
    assert "12h" in wire_values
    assert "24h" in wire_values
    assert "+numberPlate" in wire_values
    assert "-numberPlate" in wire_values

    # Dart names should be sanitized
    dart_names = [value.dart_name for value in plan.values]
    assert "value12h" in dart_names
    assert "value24h" in dart_names
    assert "plusNumberPlate" in dart_names
    assert "minusNumberPlate" in dart_names


def test_enum_value_combined_sanitization():
    """Test that multiple sanitization rules work together."""
    # Starts with digit after symbol handling
    assert to_enum_value_name("+1") == "plus1"
    # Starts with digit directly
    assert to_enum_value_name("2h") == "value2h"
    # Reserved word
    assert to_enum_value_name("class") == "classValue"
    # Normal
    assert to_enum_value_name("normal") == "normal"
