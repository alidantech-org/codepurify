"""Tests for template path expansion."""

from __future__ import annotations

from pathlib import Path

from src.contracts.names import make_contract_name
from src.emission.templates.path_expander import expand_template_path


def test_expand_template_path_strips_final_j2(tmp_path) -> None:
    schema_name = make_contract_name("User")
    output = expand_template_path(
        Path("schemas/[schema.name.path]/schema.txt.j2"),
        {"schema": {"name": schema_name}},
    )

    assert output.as_posix() == "schemas/user/schema.txt"


def test_expand_template_path_keeps_raw_file_extension(tmp_path) -> None:
    output = expand_template_path(
        Path(".gitignore"),
        {},
    )

    assert output.as_posix() == ".gitignore"


def test_expands_segment_and_inline_tokens():
    context = {
        "version": "v1",
        "schema": {"name": make_contract_name("UserProfiles")},
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
            "name": make_contract_name("UserProfiles"),
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
        "schema": {"name": make_contract_name("UserProfiles")},
    }

    result = expand_template_path(
        Path("[schema.name.path]/model.dart.j2"),
        context,
    )

    assert result.as_posix() == "user_profiles/model.dart"
