from __future__ import annotations

from typing import Any

from core.constants import HTTP_METHODS, X_CODEGEN
from inference.models import InferredOperation
from inference.resources import extract_resource_from_x_codegen
from openapi.document import OpenApiDocument
from openapi.refs import find_refs, get_ref


def infer_operations(document: OpenApiDocument) -> tuple[InferredOperation, ...]:
    operations: list[InferredOperation] = []

    for path, path_item in document.paths.items():
        if not isinstance(path_item, dict):
            continue

        path_resource = extract_resource_from_x_codegen(path_item.get(X_CODEGEN, {}))

        for method, operation in path_item.items():
            method_lower = method.lower()

            if method_lower not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            resource = extract_resource_from_x_codegen(operation.get(X_CODEGEN, {})) or path_resource
            refs = tuple(ref.raw for ref in find_refs(operation))

            operations.append(
                InferredOperation(
                    operation_id=_operation_id(method_lower, str(path), operation),
                    method=method_upper(method_lower),
                    path=str(path),
                    resource=resource,
                    parameter_refs=_parameter_refs(operation),
                    request_body_refs=_request_body_refs(operation),
                    response_refs=_response_refs(operation),
                    schema_refs=refs,
                    raw=operation,
                )
            )

    return tuple(operations)


def method_upper(method: str) -> str:
    return method.upper()


def _operation_id(method: str, path: str, operation: dict[str, Any]) -> str:
    explicit = operation.get("operationId")
    if isinstance(explicit, str) and explicit:
        return explicit

    safe_path = path.strip("/").replace("/", "_").replace("{", "").replace("}", "")
    return f"{method}_{safe_path}"


def _parameter_refs(operation: dict[str, Any]) -> tuple[str, ...]:
    refs: list[str] = []

    parameters = operation.get("parameters")
    if isinstance(parameters, list):
        for parameter in parameters:
            ref = get_ref(parameter)
            if ref is not None:
                refs.append(ref.raw)

    return tuple(refs)


def _request_body_refs(operation: dict[str, Any]) -> tuple[str, ...]:
    request_body = operation.get("requestBody")
    ref = get_ref(request_body)

    if ref is None:
        return ()

    return (ref.raw,)


def _response_refs(operation: dict[str, Any]) -> tuple[str, ...]:
    refs: list[str] = []

    responses = operation.get("responses")
    if not isinstance(responses, dict):
        return ()

    for response in responses.values():
        ref = get_ref(response)
        if ref is not None:
            refs.append(ref.raw)

    return tuple(refs)
