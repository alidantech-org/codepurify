"""Read x-codegen parameter target metadata.

This module provides utilities for reading optional x-codegen parameter
target metadata from operation nodes. It does not resolve references,
classify schemas, or make code-generation decisions. It only extracts
metadata values as written.
"""

from typing import Any

from constants.codegen import (
    PARAMETER_TARGET_SOURCE,
    PARAMETER_TARGETS_SOURCE,
    PARAMETERS,
    TARGET,
    TARGETS,
    X_CODEGEN,
)
from constants.openapi import REF


def get_parameter_target_refs(node: dict[str, Any] | None) -> tuple[str, ...]:
    """Return parameter target refs from x-codegen metadata.

    Args:
        node: An operation node that may contain x-codegen metadata.

    Returns:
        A tuple of schema reference strings from x-codegen.parameters.target
        or x-codegen.parameters.targets. Returns empty tuple if no metadata exists.
    """
    if not isinstance(node, dict):
        return ()

    x_codegen = node.get(X_CODEGEN)
    if not isinstance(x_codegen, dict):
        return ()

    parameters = x_codegen.get(PARAMETERS)
    if not isinstance(parameters, dict):
        return ()

    refs: list[str] = []

    # Check for single target
    target = parameters.get(TARGET)
    if isinstance(target, dict):
        ref = target.get(REF)
        if isinstance(ref, str):
            refs.append(ref)

    # Check for multiple targets
    targets = parameters.get(TARGETS)
    if isinstance(targets, dict):
        for target_value in targets.values():
            if isinstance(target_value, dict):
                ref = target_value.get(REF)
                if isinstance(ref, str):
                    refs.append(ref)

    return tuple(refs)


def get_parameter_target_source(node: dict[str, Any] | None) -> str | None:
    """Return the source label for parameter target metadata.

    Args:
        node: An operation node that may contain x-codegen metadata.

    Returns:
        The source label (e.g., "x-codegen.parameters.target") if metadata exists,
        or None if no metadata exists.
    """
    if not isinstance(node, dict):
        return None

    x_codegen = node.get(X_CODEGEN)
    if not isinstance(x_codegen, dict):
        return None

    parameters = x_codegen.get(PARAMETERS)
    if not isinstance(parameters, dict):
        return None

    if TARGET in parameters:
        return PARAMETER_TARGET_SOURCE

    if TARGETS in parameters:
        return PARAMETER_TARGETS_SOURCE

    return None
