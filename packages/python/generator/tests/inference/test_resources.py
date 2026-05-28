"""Tests for resource metadata inference."""

from __future__ import annotations

from src.inference.resources import extract_resource_from_x_codegen


def test_extract_resource_path_from_x_codegen() -> None:
    x_codegen = {
        "resource": {
            "name": "users",
            "path": ["platform", "auth"],
        }
    }

    resource = extract_resource_from_x_codegen(x_codegen)

    assert resource is not None
    assert resource.name == "users"
    assert resource.path == ("platform", "auth")


def test_extract_resource_ignores_invalid_path() -> None:
    x_codegen = {
        "resource": {
            "name": "users",
            "path": "platform/auth",
        }
    }

    resource = extract_resource_from_x_codegen(x_codegen)

    assert resource is not None
    assert resource.path == ()
