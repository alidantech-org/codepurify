"""Tests for path selector expansion."""

from __future__ import annotations

import pytest

from src.contracts.paths import PathConfig, PathExpose, PathSelectionMode, PathVariable, default_path_config
from src.emission.paths.selection import expand_selector_contexts


def test_expands_single_selector_each_mode():
    """Test that a selector in EACH mode loops over selected items."""
    base_context = {
        "schemas": {
            "emit_models": [
                {"name": "User", "api": {"kind": "model"}},
                {"name": "Post", "api": {"kind": "model"}},
            ]
        }
    }

    path_config = PathConfig(
        variables=(
            PathVariable(
                name="models",
                select="schemas.emit_models",
                alias="model",
                mode=PathSelectionMode.EACH,
                expose=(
                    PathExpose(name="name", expression="model.name"),
                    PathExpose(name="kind", expression="model.api.kind"),
                ),
            ),
        )
    )

    contexts = expand_selector_contexts(
        base_context=base_context,
        selector_names=("models",),
        path_config=path_config,
    )

    assert len(contexts) == 2
    assert contexts[0]["name"] == "User"
    assert contexts[0]["kind"] == "model"
    assert contexts[1]["name"] == "Post"
    assert contexts[1]["kind"] == "model"


def test_expose_makes_dynamic_path_work():
    """Test that exposed variables enable dynamic path resolution."""
    base_context = {
        "schemas": {
            "emit_models": [
                {"name": "UserProfile", "api": {"resource": "users"}},
            ]
        }
    }

    path_config = PathConfig(
        variables=(
            PathVariable(
                name="models",
                select="schemas.emit_models",
                alias="model",
                mode=PathSelectionMode.EACH,
                expose=(
                    PathExpose(name="name", expression="model.name"),
                    PathExpose(name="resource", expression="model.api.resource"),
                ),
            ),
        )
    )

    contexts = expand_selector_contexts(
        base_context=base_context,
        selector_names=("models",),
        path_config=path_config,
    )

    assert len(contexts) == 1
    # These exposed values can now be used in [name.path] and [resource] dynamic segments
    assert contexts[0]["name"] == "UserProfile"
    assert contexts[0]["resource"] == "users"


def test_missing_selector_raises_error():
    """Test that referencing an undefined selector raises a clear error."""
    base_context = {"schemas": {"emit_models": []}}

    path_config = default_path_config()

    with pytest.raises(KeyError, match="path selector not configured in paths.yaml: nonexistent"):
        expand_selector_contexts(
            base_context=base_context,
            selector_names=("nonexistent",),
            path_config=path_config,
        )


def test_selector_once_mode():
    """Test that ONCE mode selects the value without looping."""
    base_context = {
        "api": {"version": "v1"},
    }

    path_config = PathConfig(
        variables=(
            PathVariable(
                name="version",
                select="api.version",
                alias="version",
                mode=PathSelectionMode.ONCE,
            ),
        )
    )

    contexts = expand_selector_contexts(
        base_context=base_context,
        selector_names=("version",),
        path_config=path_config,
    )

    assert len(contexts) == 1
    assert contexts[0]["version"] == "v1"


def test_selector_must_resolve_to_list_for_each_mode():
    """Test that EACH mode requires the selected value to be a list/tuple."""
    base_context = {
        "schemas": {"emit_models": "not-a-list"},
    }

    path_config = PathConfig(
        variables=(
            PathVariable(
                name="models",
                select="schemas.emit_models",
                alias="model",
                mode=PathSelectionMode.EACH,
            ),
        )
    )

    with pytest.raises(TypeError, match="must resolve to a list/tuple"):
        expand_selector_contexts(
            base_context=base_context,
            selector_names=("models",),
            path_config=path_config,
        )
