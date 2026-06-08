"""Tests for TypeScript operation template metadata."""

from __future__ import annotations

from pathlib import Path

from src.contracts.api import (
    ApiContract,
    ApiDocumentInfo,
    ApiField,
    ApiFieldKind,
    ApiFieldType,
    ApiOperation,
    ApiOperationTarget,
    ApiParameter,
    ApiRequestBody,
    ApiResource,
    ApiResponse,
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


def test_typescript_operation_exposes_codegen_ui_metadata(tmp_path: Path) -> None:
    api = ApiContract(
        info=ApiDocumentInfo(title="UI API", api_version="v1"),
        resources=(
            ApiResource(
                id="users",
                name=make_contract_name("users"),
                operations_count=1,
            ),
        ),
        operations=(
            ApiOperation(
                id="listUsers",
                name=make_contract_name("listUsers"),
                method="get",
                path="/users",
                resource="users",
                meta={
                    "ui": {
                        "enabled": True,
                        "role": "list",
                        "inferred": True,
                        "inferenceSource": "compiler",
                        "inferenceReason": "GET collection route",
                    }
                },
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

    assert operation.meta.ui_enabled is True
    assert operation.meta.ui_role == "list"
    assert operation.meta.ui_inferred is True
    assert operation.meta.ui_inference_source == "compiler"
    assert operation.meta.ui_inference_reason == "GET collection route"


def test_typescript_operation_keeps_codegen_ui_disabled_by_default(tmp_path: Path) -> None:
    api = ApiContract(
        info=ApiDocumentInfo(title="UI API", api_version="v1"),
        resources=(
            ApiResource(
                id="auth",
                name=make_contract_name("auth"),
                operations_count=1,
            ),
        ),
        operations=(
            ApiOperation(
                id="login",
                name=make_contract_name("login"),
                method="post",
                path="/auth/login",
                resource="auth",
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

    assert operation.meta.ui_enabled is False
    assert operation.meta.ui_role is None
    assert operation.meta.ui_inferred is False


def test_typescript_operation_exposes_ui_list_response_metadata(tmp_path: Path) -> None:
    user_ref = "#/components/schemas/UserPartial"
    response_ref = "#/components/schemas/UsersListResponse"
    pagination_ref = "#/components/schemas/PaginationMeta"

    api = ApiContract(
        info=ApiDocumentInfo(title="UI API", api_version="v1"),
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
                    id="UserPartial",
                    name=make_contract_name("UserPartial"),
                    ref=user_ref,
                    kind=ApiSchemaKind.DTO,
                    resource="users",
                ),
                ApiSchema(
                    id="PaginationMeta",
                    name=make_contract_name("PaginationMeta"),
                    ref=pagination_ref,
                    kind=ApiSchemaKind.DTO,
                    resource="shared",
                ),
                ApiSchema(
                    id="UsersListResponse",
                    name=make_contract_name("UsersListResponse"),
                    ref=response_ref,
                    kind=ApiSchemaKind.DTO,
                    resource="users",
                    fields=(
                        ApiField(
                            id="users",
                            name=make_contract_name("users"),
                            type=ApiFieldType(
                                kind=ApiFieldKind.ARRAY,
                                item_kind=ApiFieldKind.DTO,
                            ),
                            item_ref=user_ref,
                            item_refs=(user_ref,),
                        ),
                        ApiField(
                            id="pagination",
                            name=make_contract_name("pagination"),
                            type=ApiFieldType(
                                kind=ApiFieldKind.DTO,
                                type="PaginationMeta",
                            ),
                            schema_ref=pagination_ref,
                            schema_refs=(pagination_ref,),
                        ),
                    ),
                ),
            ),
            dtos=(),
        ),
        operations=(
            ApiOperation(
                id="listUsers",
                name=make_contract_name("listUsers"),
                method="get",
                path="/users",
                resource="users",
                responses=(
                    ApiResponse(
                        status_code="200",
                        schema_refs=(response_ref,),
                        is_success=True,
                    ),
                ),
                meta={
                    "ui": {
                        "enabled": True,
                        "role": "list",
                        "inferred": True,
                    }
                },
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

    assert operation.meta.ui_list_field == "users"
    assert operation.meta.ui_list_item_type == "UserPartial"
    assert operation.meta.ui_pagination_field == "pagination"
