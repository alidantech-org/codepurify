from __future__ import annotations

from typing import Any

from constants.codegen import X_CODEGEN
from inference.models import InferredResource
from inference.resources import extract_resource_from_x_codegen


def infer_resource(
    operation: dict[str, Any],
    path_item: dict[str, Any],
    path_resource: InferredResource | None,
) -> InferredResource | None:
    """Infer resource ownership from operation and path metadata."""
    operation_resource = extract_resource_from_x_codegen(operation.get(X_CODEGEN, {}))
    return operation_resource or path_resource
