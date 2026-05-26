"""Tests for the debug language adapter."""

from __future__ import annotations

from src.languages.discovery import resolve_language_adapter
from tests.fixtures.contracts import make_api_contract


def test_debug_adapter_builds_template_contract(tmp_path) -> None:
    adapter = resolve_language_adapter("debug")
    api = make_api_contract()

    contract = adapter.build_template_contract(
        api=api,
        output_path=tmp_path,
        template_root=tmp_path / "templates",
        dry_run=True,
    )

    assert contract.lang.name == "debug"
    assert contract.api.info.title == "Test API"
    assert contract.emit.dry_run is True
    assert len(contract.resources) == 1
    assert len(contract.schemas.all) == 1
