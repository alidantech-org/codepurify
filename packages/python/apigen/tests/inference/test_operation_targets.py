"""Tests for operation target inference."""

from __future__ import annotations

from pathlib import Path

from src.inference.operations.engine import infer_operations
from src.openapi.document import OpenApiDocument


def test_infer_operation_target_from_parameter_target_metadata() -> None:
    document = OpenApiDocument(
        path=Path("openapi.json"),
        raw={
            "openapi": "3.1.0",
            "info": {"title": "Query API", "version": "v1"},
            "paths": {
                "/users": {
                    "get": {
                        "operationId": "listUsers",
                        "parameters": [
                            {
                                "name": "page",
                                "in": "query",
                                "schema": {"$ref": "#/components/schemas/SharedPage"},
                            }
                        ],
                        "x-codegen": {
                            "parameters": {
                                "target": {"$ref": "#/components/schemas/UserListQuery"},
                            }
                        },
                        "responses": {"200": {"description": "OK"}},
                    }
                }
            },
        },
    )

    operation = infer_operations(document)[0]

    assert operation.target is not None
    assert operation.target.ref == "#/components/schemas/UserListQuery"
    assert operation.target.source == "x-codegen.parameters.target"
    assert operation.target.inferred_roles == ("query",)
    assert operation.target.locations == ("query",)
