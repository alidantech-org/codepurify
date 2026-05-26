"""Contract fixture helpers."""

from __future__ import annotations

from pathlib import Path

from src.contracts.api import ApiContract, ApiDocumentInfo, ApiOperation, ApiResource, ApiSchema
from src.contracts.names import make_contract_name
from src.contracts.template import (
    TemplateContract,
    TemplateEmit,
    TemplateLanguage,
    TemplateProject,
    TemplateResource,
    TemplateSchema,
)


def make_api_contract() -> ApiContract:
    """Create a small API contract for tests."""
    return ApiContract(
        info=ApiDocumentInfo(
            title="Test API",
            openapi_version="3.1.0",
            api_version="v1",
        ),
        resources=(
            ApiResource(
                id="users",
                name=make_contract_name("users"),
                path="users",
                operations_count=1,
            ),
        ),
        schemas=(
            ApiSchema(
                id="User",
                name=make_contract_name("User"),
                kind="model",
                ref="#/components/schemas/User",
                resource="users",
            ),
        ),
        operations=(
            ApiOperation(
                id="listUsers",
                name=make_contract_name("listUsers"),
                method="get",
                path="/users",
                resource="users",
            ),
        ),
    )


def make_template_contract(output_path: Path, template_root: Path | None = None) -> TemplateContract:
    """Create a small template contract for emission tests."""
    api = make_api_contract()

    return TemplateContract(
        project=TemplateProject(name=make_contract_name("test_package")),
        api=api,
        lang=TemplateLanguage(name="debug"),
        emit=TemplateEmit(output_path=output_path, template_root=template_root, dry_run=False),
        resources=(
            TemplateResource(api=api.resources[0], name=api.resources[0].name),
        ),
        schemas=(
            TemplateSchema(api=api.schemas[0], name=api.schemas[0].name),
        ),
    )
