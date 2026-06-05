"""Tests for Dart route endpoint preparation."""

from __future__ import annotations

from pathlib import Path

from src.contracts.api import ApiContract, ApiDocumentInfo, ApiOperation, ApiResource
from src.contracts.names import make_contract_name
from languages.dart.adapter import DartLanguageAdapter
from src.languages.dart.urls import build_endpoint_path


def test_build_endpoint_path_keeps_routes_versionless() -> None:
    assert build_endpoint_path("/auth/login") == "/auth/login"
    assert build_endpoint_path("auth/login") == "/auth/login"


def test_dart_operation_exposes_versionless_endpoint_paths_and_request_version(tmp_path: Path) -> None:
    api = ApiContract(
        info=ApiDocumentInfo(title="Route API", api_version="v1"),
        resources=(
            ApiResource(
                id="auth",
                name=make_contract_name("auth"),
                operations_count=2,
            ),
        ),
        operations=(
            ApiOperation(
                id="login",
                name=make_contract_name("login"),
                method="post",
                path="/auth/login",
                resource="auth",
            ),
            ApiOperation(
                id="userById",
                name=make_contract_name("userById"),
                method="get",
                path="/users/{userId}",
                resource="auth",
            ),
        ),
    )

    contract = DartLanguageAdapter().build_template_contract(
        api=api,
        output_path=tmp_path,
        template_root=tmp_path / "templates",
        dry_run=True,
    )

    login, user_by_id = contract.operations

    assert login.lang.endpoint_path == "/auth/login"
    assert login.lang.dart_interpolated_endpoint_path == "/auth/login"
    assert login.lang.version == "v1"
    assert user_by_id.lang.endpoint_path == "/users/{userId}"
    assert user_by_id.lang.dart_interpolated_endpoint_path == "/users/$userId"
    assert user_by_id.lang.version == "v1"


def test_dart_contract_features_include_only_resources_with_operations(tmp_path: Path) -> None:
    api = ApiContract(
        info=ApiDocumentInfo(title="Feature API", api_version="v1"),
        resources=(
            ApiResource(
                id="auth",
                name=make_contract_name("auth"),
                operations_count=1,
            ),
            ApiResource(
                id="shared",
                name=make_contract_name("shared"),
                operations_count=0,
            ),
        ),
        operations=(
            ApiOperation(
                id="login",
                name=make_contract_name("login"),
                method="post",
                path="/auth/login",
                resource="auth",
            ),
        ),
    )

    contract = DartLanguageAdapter().build_template_contract(
        api=api,
        output_path=tmp_path,
        template_root=tmp_path / "templates",
        dry_run=True,
    )

    assert tuple(resource.api.id for resource in contract.resources) == ("auth", "shared")
    assert tuple(resource.api.id for resource in contract.features) == ("auth",)
