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


def test_infer_parameter_target_keeps_query_role_with_path_and_referenced_query() -> None:
    document = OpenApiDocument(
        path=Path("openapi.json"),
        raw={
            "openapi": "3.1.0",
            "info": {"title": "Query API", "version": "v1"},
            "paths": {
                "/companies/{companyId}/availability": {
                    "get": {
                        "operationId": "getCompanyAvailability",
                        "parameters": [
                            {
                                "name": "companyId",
                                "in": "path",
                                "required": True,
                                "schema": {"$ref": "#/components/schemas/SharedMongoId"},
                            },
                            {
                                "$ref": "#/components/parameters/AvailabilityFieldsQueryParam",
                            },
                        ],
                        "x-codegen": {
                            "parameters": {
                                "target": {
                                    "$ref": "#/components/schemas/CompanyAvailabilityDetailQuery",
                                },
                            }
                        },
                        "responses": {"200": {"description": "OK"}},
                    }
                }
            },
            "components": {
                "parameters": {
                    "AvailabilityFieldsQueryParam": {
                        "name": "fields",
                        "in": "query",
                        "required": False,
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/components/schemas/CompanyAvailabilitySelect",
                            },
                        },
                    }
                }
            },
        },
    )

    operation = infer_operations(document)[0]

    assert operation.target is not None
    assert operation.target.ref == "#/components/schemas/CompanyAvailabilityDetailQuery"
    assert operation.target.source == "x-codegen.parameters.target"
    assert operation.target.inferred_roles == ("params", "query")
    assert operation.target.locations == ("path", "query")
