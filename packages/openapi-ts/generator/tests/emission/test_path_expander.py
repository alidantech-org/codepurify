"""Tests for template path expansion."""

from pathlib import Path

from emission.templates.path_expander import expand_template_path
from utils.naming import build_name


def test_expands_segment_and_inline_tokens():
    context = {
        "version": "v1",
        "schema": {"name": build_name("UserProfiles")},
    }

    result = expand_template_path(
        Path("lib/[version]/(schema.name.path.s)_model.dart.j2"),
        context,
    )

    assert result.as_posix() == "lib/v1/user_profile_model.dart"


def test_expands_spread_tokens():
    context = {
        "version": "v1",
        "schema": {
            "name": build_name("UserProfiles"),
            "output": {"parts": ["models", "users"]},
        },
    }

    result = expand_template_path(
        Path("lib/[version]/[...schema.output.parts]/[schema.name.path.s]/model.dart.j2"),
        context,
    )

    assert result.as_posix() == "lib/v1/models/users/user_profile/model.dart"


def test_original_is_default_for_name_case():
    context = {
        "schema": {"name": build_name("UserProfiles")},
    }

    result = expand_template_path(
        Path("[schema.name.path]/model.dart.j2"),
        context,
    )

    assert result.as_posix() == "user_profiles/model.dart"
