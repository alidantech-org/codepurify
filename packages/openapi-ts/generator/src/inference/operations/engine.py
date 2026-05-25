from __future__ import annotations

from constants.codegen import X_CODEGEN
from constants.http import HTTP_METHODS
from constants.openapi import OPERATION_ID, PARAMETERS, REQUEST_BODY, RESPONSES
from inference.models import InferredOperation, InferredOperationTarget
from inference.metadata.targets import get_codegen_target_ref, get_codegen_target_source
from inference.operations.parameters import infer_parameters
from inference.operations.request_bodies import infer_request_body
from inference.operations.responses import infer_responses
from inference.operations.resources import infer_resource
from inference.resources import extract_resource_from_x_codegen
from openapi.document import OpenApiDocument


def infer_operations(document: OpenApiDocument) -> tuple[InferredOperation, ...]:
    operations: list[InferredOperation] = []

    for path, path_item in document.paths.items():
        if not isinstance(path_item, dict):
            continue

        path_resource = extract_resource_from_x_codegen(path_item.get(X_CODEGEN, {}))
        path_parameters = infer_parameters(path_item.get(PARAMETERS), document)

        for method, operation in path_item.items():
            method_lower = method.lower()

            if method_lower not in HTTP_METHODS:
                continue

            if not isinstance(operation, dict):
                continue

            resource = infer_resource(operation, path_item, path_resource)
            parameters = infer_parameters(operation.get(PARAMETERS), document, path_parameters)
            request_body = infer_request_body(operation.get(REQUEST_BODY), document)
            responses = infer_responses(operation.get(RESPONSES), document)
            target = infer_operation_target(operation, parameters, request_body, responses)

            operations.append(
                InferredOperation(
                    operation_id=_operation_id(method_lower, str(path), operation),
                    method=method_upper(method_lower),
                    path=str(path),
                    resource=resource,
                    parameters=parameters,
                    request_body=request_body,
                    responses=responses,
                    target=target,
                    raw=operation,
                )
            )

    return tuple(operations)


def infer_operation_target(
    operation: dict,
    parameters: tuple,
    request_body,
    responses: tuple,
) -> InferredOperationTarget | None:
    """Infer generic operation target from x-codegen.target metadata.

    Args:
        operation: The operation node.
        parameters: Inferred parameters.
        request_body: Inferred request body.
        responses: Inferred responses.

    Returns:
        An InferredOperationTarget if target metadata exists, None otherwise.
    """
    target_ref = get_codegen_target_ref(operation)
    if not target_ref:
        return None

    source = get_codegen_target_source(operation) or "x-codegen.target"

    # Infer roles from operation context
    inferred_roles: list[str] = []
    locations: list[str] = []

    if parameters:
        param_locations = set(param.location for param in parameters)
        locations.extend(param_locations)

        if "query" in param_locations:
            inferred_roles.append("query")
        if "path" in param_locations:
            inferred_roles.append("params")

    if request_body:
        inferred_roles.append("body")

    if responses:
        success_responses = [r for r in responses if r.is_success]
        if success_responses:
            inferred_roles.append("response")

    return InferredOperationTarget(
        ref=target_ref,
        source=source,
        exclude=(),
        inferred_roles=tuple(sorted(set(inferred_roles))),
        locations=tuple(sorted(set(locations))),
        reason="inferred from operation context",
    )


def method_upper(method: str) -> str:
    return method.upper()


def _operation_id(method: str, path: str, operation: dict) -> str:
    explicit = operation.get(OPERATION_ID)
    if isinstance(explicit, str) and explicit:
        return explicit

    safe_path = path.strip("/").replace("/", "_").replace("{", "").replace("}", "")
    return f"{method}_{safe_path}"
