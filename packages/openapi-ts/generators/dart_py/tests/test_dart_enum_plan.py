from dart.planning.enum_plan import build_enum_plan, to_enum_value_name
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from pathlib import Path

from constants.sdk_tags import X_SDK_DOMAIN


def test_builds_enum_plan() -> None:
    schema_name = "UserStatus"
    schema = {
        "type": "string",
        "enum": ["active", "inactive", "suspended"],
        X_SDK_DOMAIN: "user",
    }

    symbol = DartSymbol(
        schema_name=schema_name,
        dart_name="UserStatus",
        kind=SchemaKind.ENUM,
        path=Path("enums/user/user_status.dart"),
    )

    plan = build_enum_plan(schema_name, schema, symbol)

    assert plan.enum_name == "UserStatus"
    assert plan.schema_name == schema_name
    assert plan.output_path == Path("enums/user/user_status.dart")
    assert len(plan.values) == 3

    values = {v.wire_value: v.dart_name for v in plan.values}
    assert values["active"] == "active"
    assert values["inactive"] == "inactive"
    assert values["suspended"] == "suspended"


def test_converts_kebab_case_to_camel_case() -> None:
    assert to_enum_value_name("in-progress") == "inProgress"
    assert to_enum_value_name("service-provider") == "serviceProvider"


def test_handles_reserved_words() -> None:
    assert to_enum_value_name("class") == "classValue"
    assert to_enum_value_name("default") == "defaultValue"
    assert to_enum_value_name("new") == "newValue"
