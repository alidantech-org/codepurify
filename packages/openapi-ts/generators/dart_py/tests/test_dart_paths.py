from dart.render.paths import enum_path, model_path
from pathlib import Path

from constants.sdk_tags import X_SDK_DOMAIN


def test_groups_public_user_with_user_models() -> None:
    assert model_path("PublicUser") == Path("models/user/public_user.dart")


def test_groups_partial_public_user_with_user_models() -> None:
    assert model_path("PartialPublicUser") == Path("models/user/partial_public_user.dart")


def test_groups_user_status_enum() -> None:
    schema = {X_SDK_DOMAIN: "user"}
    assert enum_path("UserStatus", schema) == Path("enums/user/user_status.dart")
