"""Tests for TypeScript operation template metadata."""

from __future__ import annotations

from pathlib import Path

from src.contracts.api import (
    ApiContract,
    ApiDocumentInfo,
    ApiOperation,
    ApiOperationTarget,
    ApiParameter,
    ApiRequestBody,
    ApiResource,
    ApiSchema,
    ApiSchemaGroups,
    ApiSchemaKind,
)
from src.contracts.names import make_contract_name
from src.languages.typescript.adapter import TypeScriptLanguageAdapter


def test_typescript_operation_uses_parameter_target_as_query_type(tmp_path: Path) -> None:
    query_ref = "#/components/schemas/UserListQuery"

    api = ApiContract(
        info=ApiDocumentInfo(title="Query API", api_version="v1"),
        resources=(
            ApiResource(
                id="users",
                name=make_contract_name("users"),
                operations_count=1,
            ),
        ),
        schemas=ApiSchemaGroups(
            all=(
                ApiSchema(
                    id="UserListQuery",
                    name=make_contract_name("UserListQuery"),
                    ref=query_ref,
                    kind=ApiSchemaKind.DTO,
                    resource="users",
                ),
            ),
        ),
        operations=(
            ApiOperation(
                id="listUsers",
                name=make_contract_name("listUsers"),
                method="get",
                path="/users",
                resource="users",
                parameters=(
                    ApiParameter(
                        id="page",
                        name=make_contract_name("page"),
                        location="query",
                        schema_ref="#/components/schemas/SharedPage",
                    ),
                ),
                target=ApiOperationTarget(
                    ref=query_ref,
                    source="x-codegen.parameters.target",
                    inferred_roles=("query",),
                    locations=("query",),
                ),
            ),
        ),
    )

    contract = TypeScriptLanguageAdapter().build_template_contract(
        api=api,
        output_path=tmp_path,
        template_root=tmp_path / "templates",
        dry_run=True,
    )

    operation = contract.operations[0]

    assert operation.meta.query_ref == query_ref
    assert operation.meta.query_type == "UserListQuery"


def test_typescript_operation_exposes_request_content_type_flags(tmp_path: Path) -> None:
    body_ref = "#/components/schemas/UploadFileBody"

    api = ApiContract(
        info=ApiDocumentInfo(title="Upload API", api_version="v1"),
        resources=(
            ApiResource(
                id="uploads",
                name=make_contract_name("uploads"),
                operations_count=1,
            ),
        ),
        schemas=ApiSchemaGroups(
            all=(
                ApiSchema(
                    id="UploadFileBody",
                    name=make_contract_name("UploadFileBody"),
                    ref=body_ref,
                    kind=ApiSchemaKind.DTO,
                    resource="uploads",
                ),
            ),
        ),
        operations=(
            ApiOperation(
                id="uploadFile",
                name=make_contract_name("uploadFile"),
                method="post",
                path="/uploads",
                resource="uploads",
                request_body=ApiRequestBody(
                    required=True,
                    content_types=("multipart/form-data",),
                    schema_refs=(body_ref,),
                ),
            ),
        ),
    )

    contract = TypeScriptLanguageAdapter().build_template_contract(
        api=api,
        output_path=tmp_path,
        template_root=tmp_path / "templates",
        dry_run=True,
    )

    operation = contract.operations[0]

    assert operation.meta.request_content_types == ("multipart/form-data",)
    assert operation.meta.request_content_type == "multipart/form-data"
    assert operation.meta.is_multipart_request is True
    assert operation.meta.is_json_request is False
