"""Tests for building API contracts from inference graphs."""

from __future__ import annotations

from src.inference.contract import build_api_contract
from tests.fixtures.openapi import load_sample_graph


def test_build_api_contract_from_sample_openapi(sample_openapi_path) -> None:
    graph = load_sample_graph(sample_openapi_path)
    api = build_api_contract(graph)

    assert api.info.title
    assert api.info.openapi_version.startswith("3.")
    assert len(api.schemas.all) > 0
    assert len(api.operations) > 0


def test_api_contract_preserves_operation_facts(sample_openapi_path) -> None:
    graph = load_sample_graph(sample_openapi_path)
    api = build_api_contract(graph)

    operation = api.operations[0]

    assert operation.id
    assert operation.method
    assert operation.path


def test_api_contract_preserves_resource_path(sample_openapi_path) -> None:
    graph = load_sample_graph(sample_openapi_path)
    api = build_api_contract(graph)

    resource = next(resource for resource in api.resources if resource.id == "users")

    assert resource.path == ("platform", "auth")
    assert resource.path_name is not None
    assert resource.path_name.path.original == "platform_auth"
