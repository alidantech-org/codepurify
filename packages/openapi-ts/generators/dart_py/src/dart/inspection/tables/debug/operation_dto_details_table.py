"""
Operation DTO details table printer (debug mode).
"""

from rich.table import Table

from constants.openapi_keys import (
    HTTP_METHODS,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
    OPENAPI_REQUEST_BODY,
    OPENAPI_RESPONSES,
)
from dart.planning.operation_usage import (
    extract_schema_from_request_body,
    extract_schema_from_response,
)
from logger import console
from ...models import DartInspection


def print_operation_dto_details_table(inspection: DartInspection) -> None:
    """Print Operation DTO Details table."""
    plans = inspection.plans

    dto_table = Table(title="Operation DTO Details")
    dto_table.add_column("#", style="dim")
    dto_table.add_column("Operation", style="cyan")
    dto_table.add_column("DTO Name", style="yellow")
    dto_table.add_column("Usage", style="green")
    dto_table.add_column("Fields", style="magenta")
    dto_table.add_column("Source", style="blue")
    dto_table.add_column("Output Path", style="dim")

    row_num = 1
    for path, path_item in inspection.spec.get(OPENAPI_PATHS, {}).items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue
            if not isinstance(operation, dict):
                continue
            operation_id = operation.get(OPENAPI_OPERATION_ID, f"{method}_{path}")

            # Request body
            request_body = operation.get(OPENAPI_REQUEST_BODY)
            if request_body:
                schema_ref = extract_schema_from_request_body(request_body, inspection.spec)
                if schema_ref and schema_ref in plans.classes:
                    plan = plans.classes[schema_ref]
                    dto_table.add_row(
                        str(row_num),
                        operation_id,
                        plan.class_name,
                        "request_body",
                        str(len(plan.fields)),
                        schema_ref,
                        str(plan.model_path),
                    )
                    row_num += 1

            # Responses
            responses = operation.get(OPENAPI_RESPONSES, {})
            for status, response in responses.items():
                if not isinstance(response, dict):
                    continue
                schema_ref = extract_schema_from_response(response, inspection.spec)
                if schema_ref and schema_ref in plans.classes:
                    plan = plans.classes[schema_ref]
                    dto_table.add_row(
                        str(row_num),
                        operation_id,
                        plan.class_name,
                        f"response ({status})",
                        str(len(plan.fields)),
                        schema_ref,
                        str(plan.model_path),
                    )
                    row_num += 1

    console.print(dto_table)
