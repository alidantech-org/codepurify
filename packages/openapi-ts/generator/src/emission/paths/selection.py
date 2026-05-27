"""Selector expansion for template paths."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from contracts.paths import PathConfig, PathSelectionMode, PathVariable
from emission.templates.resolver import resolve_variable


def expand_selector_contexts(
    base_context: Mapping[str, Any],
    selector_names: tuple[str, ...],
    path_config: PathConfig,
) -> tuple[dict[str, Any], ...]:
    """Expand selector names into render contexts."""
    contexts = (dict(base_context),)
    variables = path_config.variable_by_name()

    for selector_name in selector_names:
        if selector_name not in variables:
            raise KeyError(f"path selector not configured in paths.yaml: {selector_name}")

        variable = variables[selector_name]
        contexts = _expand_one(contexts, variable)

    return contexts


def _expand_one(
    contexts: tuple[dict[str, Any], ...],
    variable: PathVariable,
) -> tuple[dict[str, Any], ...]:
    expanded: list[dict[str, Any]] = []

    for context in contexts:
        selected = resolve_variable(context, variable.select)

        if variable.mode == PathSelectionMode.ONCE:
            expanded.append(_bind_context(context, variable, selected))
            continue

        if not isinstance(selected, (list, tuple)):
            raise TypeError(f"selector '{variable.name}' must resolve to a list/tuple")

        for item in selected:
            expanded.append(_bind_context(context, variable, item))

    return tuple(expanded)


def _bind_context(
    context: dict[str, Any],
    variable: PathVariable,
    item: Any,
) -> dict[str, Any]:
    bound = dict(context)
    bound[variable.alias] = item

    for exposed in variable.expose:
        bound[exposed.name] = resolve_variable(bound, exposed.expression)

    return bound
