from dart.planning.class_plan import build_class_plan
from dart.domain.kinds import SchemaKind
from dart.registry import DartSymbol
from pathlib import Path

from constants.dart_types import DART_STRING
from constants.paths import DEFAULT_DART_PACKAGE_NAME


def test_builds_class_plan_for_model() -> None:
    schema_name = "User"
    schema = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
            "email": {"type": "string"},
        },
        "required": ["id"],
    }

    symbol = DartSymbol(
        schema_name=schema_name,
        dart_name="User",
        kind=SchemaKind.MODEL,
        path=Path("models/user/user.dart"),
    )

    symbol_registry = {
        "EmailField": DartSymbol(
            schema_name="EmailField",
            dart_name=DART_STRING,
            kind=SchemaKind.PRIMITIVE_ALIAS,
            path=None,
        ),
        "MongoIdField": DartSymbol(
            schema_name="MongoIdField",
            dart_name=DART_STRING,
            kind=SchemaKind.PRIMITIVE_ALIAS,
            path=None,
        ),
    }

    plan = build_class_plan(schema_name, schema, symbol, symbol_registry, DEFAULT_DART_PACKAGE_NAME)

    assert plan.class_name == "User"
    assert plan.schema_name == schema_name
    assert plan.kind == SchemaKind.MODEL
    assert plan.artifact_folder == Path("models/user")
    assert plan.model_path == Path("models/user/model.dart")
    assert plan.fields_class_name == "UserFields"
    assert len(plan.fields) == 2
    assert plan.generate_constructor
    assert plan.generate_from_json
