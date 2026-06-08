"""Tests for Jinja template rendering."""

from __future__ import annotations

from pathlib import Path

from src.emission.templates.renderer import render_template


def test_render_template_uses_contract_context(tmp_path: Path) -> None:
    template_root = tmp_path / "templates"
    template_root.mkdir()
    template = template_root / "hello.txt.j2"
    template.write_text("Hello {{ name }}", encoding="utf-8")

    output = render_template(
        template_root=template_root,
        relative_path=Path("hello.txt.j2"),
        context={"name": "World"},
    )

    assert output == "Hello World"


def test_dart_version_barrel_exports_match_path_config(project_root: Path) -> None:
    output = render_template(
        template_root=project_root / "templates" / "dart",
        relative_path=Path("{version}") / "v1.dart.j2",
        context={
            "schemas": {
                "emit_models": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "user_public"}},
                    }
                ],
                "emit_dtos": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "create_user_body"}},
                    }
                ],
                "emit_enums": [
                    {
                        "emit": {"resource_path": ("platform", "auth", "users")},
                        "name": {"path": {"o": "user_status"}},
                    }
                ],
            },
            "features": [],
        },
    )

    assert "export 'schemas/models/platform/auth/users/user_public/index.dart';" in output
    assert "export 'schemas/models/platform/auth/users/create_user_body/index.dart';" in output
    assert "export 'schemas/enums/user_status/index.dart';" in output
    assert "schemas/platform/auth/users/enums" not in output
    assert "schemas/platform/auth/users/dtos" not in output


def test_next_routes_template_renders_path_param_functions(project_root: Path) -> None:
    output = render_template(
        template_root=project_root / "templates" / "next",
        relative_path=Path("{root}") / "routes.ts.j2",
        context={
            "resources": [
                {
                    "name": {"camel": {"o": "companyMembers"}},
                    "operations": [
                        {
                            "lang": {"function_name": "getCompanyMember"},
                            "api": {"path": "/companies/{companyId}/members/{memberId}"},
                            "meta": {
                                "has_path_params": True,
                                "path_params": ("companyId", "memberId"),
                            },
                        }
                    ],
                }
            ]
        },
    )

    assert "companyMembers" in output
    assert "getCompanyMember" in output
    assert "`/companies/${companyId}/members/${memberId}`" in output


def test_next_action_template_renders_multipart_action(project_root: Path) -> None:
    output = render_template(
        template_root=project_root / "templates" / "next",
        relative_path=Path("{resource}") / "[resource.name.path.o].actions.ts.j2",
        context={
            "file": {"imports": []},
            "resource": {
                "name": {
                    "path": {"o": "uploads"},
                    "camel": {"o": "uploads"},
                },
                "operations": [
                    {
                        "name": {"pascal": {"o": "UploadFile"}},
                        "lang": {"function_name": "uploadFile", "method": "post"},
                        "request_body": {"lang": {"required": True}},
                        "meta": {
                            "response_type": "UploadResponse",
                            "has_path_params": False,
                            "path_params": (),
                            "query_type": None,
                            "body_type": "UploadFileBody",
                            "is_multipart_request": True,
                        },
                    }
                ],
            },
        },
    )

    assert "body: FormData" in output
    assert "requestOptions(" in output
    assert "api.post<UploadResponse>(endpoint, input.body, options)" in output


def test_next_action_template_only_passes_query_when_query_type_exists(
    project_root: Path,
) -> None:
    output = render_template(
        template_root=project_root / "templates" / "next",
        relative_path=Path("{resource}") / "[resource.name.path.o].actions.ts.j2",
        context={
            "file": {"imports": []},
            "resource": {
                "name": {
                    "path": {"o": "availability"},
                    "camel": {"o": "availability"},
                },
                "operations": [
                    {
                        "name": {"pascal": {"o": "GetCompanyAvailability"}},
                        "lang": {
                            "function_name": "getCompanyAvailability",
                            "method": "get",
                        },
                        "request_body": None,
                        "meta": {
                            "response_type": "CompanyAvailabilityResponse",
                            "has_path_params": True,
                            "path_params": ("companyId",),
                            "query_type": "CompanyAvailabilityDetailQuery",
                            "body_type": None,
                            "is_multipart_request": False,
                        },
                    },
                    {
                        "name": {"pascal": {"o": "DeleteCompanyAvailability"}},
                        "lang": {
                            "function_name": "deleteCompanyAvailability",
                            "method": "delete",
                        },
                        "request_body": None,
                        "meta": {
                            "response_type": "CompanyAvailabilityDeletedResponse",
                            "has_path_params": True,
                            "path_params": ("companyId",),
                            "query_type": None,
                            "body_type": None,
                            "is_multipart_request": False,
                        },
                    },
                ],
            },
        },
    )

    assert "query?: CompanyAvailabilityDetailQuery;" in output
    assert "input?.query as Record<string, unknown> | undefined" in output
    assert output.count("input?.query as Record<string, unknown> | undefined") == 1
    assert "undefined,\n    false,\n  );" in output


def test_next_resource_dto_barrel_exports_resource_dtos(project_root: Path) -> None:
    output = render_template(
        template_root=project_root / "templates" / "next",
        relative_path=Path("{resource_dto}") / "index.ts.j2",
        context={
            "resource": {
                "dtos": [
                    {"name": {"path": {"o": "notification_list_response"}}},
                    {"name": {"path": {"o": "notification_partial"}}},
                ]
            }
        },
    )

    assert "export * from './notification_list_response';" in output
    assert "export * from './notification_partial';" in output
