from dart.classify.schemas import classify_schema
from dart.domain.kinds import SchemaKind


def test_classifies_primitive_alias() -> None:
    assert classify_schema("EmailField", {"type": "string"}) == SchemaKind.PRIMITIVE_ALIAS


def test_classifies_date_time_alias() -> None:
    assert classify_schema("CreatedAtField", {"type": "string", "format": "date-time"}) == SchemaKind.PRIMITIVE_ALIAS


def test_classifies_enum() -> None:
    assert classify_schema("UserStatus", {"type": "string", "enum": ["active"]}) == SchemaKind.ENUM


def test_classifies_model() -> None:
    assert (
        classify_schema(
            "User",
            {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                },
            },
        )
        == SchemaKind.MODEL
    )


def test_classifies_dto() -> None:
    assert (
        classify_schema(
            "CreateUserBody",
            {
                "type": "object",
                "properties": {
                    "email": {"type": "string"},
                },
            },
        )
        == SchemaKind.DTO
    )
