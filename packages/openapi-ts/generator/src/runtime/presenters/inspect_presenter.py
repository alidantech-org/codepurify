from __future__ import annotations

from core.logging import key_value_table
from openapi.inspector import OpenApiInspection


def present_inspection(inspection: OpenApiInspection) -> None:
    key_value_table(
        "OpenAPI Summary",
        [
            ("Title", inspection.title),
            ("OpenAPI", inspection.openapi_version),
            ("API Version", inspection.api_version),
            ("Paths", inspection.path_count),
            ("Operations", inspection.operation_count),
            ("Schemas", inspection.schema_count),
            ("Responses", inspection.response_count),
            ("Request Bodies", inspection.request_body_count),
            ("Parameters", inspection.parameter_count),
            ("Refs", inspection.ref_count),
            ("Component Refs", inspection.component_ref_count),
            ("Missing Component Refs", inspection.missing_component_ref_count),
        ],
    )

    if inspection.resources:
        rows = [
            (
                resource.name,
                "/".join(resource.path) if resource.path else "-",
                resource.operation_count,
            )
            for resource in inspection.resources
        ]

        from rich.table import Table
        from core.logging import console

        table = Table(title="Detected Resources", show_header=True, header_style="bold cyan")
        table.add_column("Resource")
        table.add_column("Path")
        table.add_column("Operations")

        for name, path, count in rows:
            table.add_row(str(name), str(path), str(count))

        console.print(table)
