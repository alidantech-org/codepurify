"""
Operation plans table printer.
"""

from rich.table import Table

from constants.openapi_keys import (
    HTTP_METHODS,
    OPENAPI_OPERATION_ID,
    OPENAPI_PATHS,
)
from logger import console
from ..models import DartInspection


def print_operation_plans_table(inspection: DartInspection) -> None:
    """Print operation plans table."""
    operation_plans = inspection.operation_plans

    if not operation_plans:
        return

    op_table = Table(title="Operations Plan")
    op_table.add_column("#", style="dim")
    op_table.add_column("Path", style="cyan")
    op_table.add_column("Method", style="yellow")
    op_table.add_column("operationId", style="green")
    op_table.add_column("Tags", style="magenta")
    op_table.add_column("Path Params", style="blue")
    op_table.add_column("Query Params", style="dim")
    op_table.add_column("Request Body", style="red")
    op_table.add_column("Responses", style="cyan")

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
            if operation_id not in operation_plans:
                continue

            plan = operation_plans[operation_id]

            path_params_count = (
                len(plan.params_plan.path_params) if plan.params_plan else 0
            )
            query_params_count = (
                len(plan.params_plan.query_params) if plan.params_plan else 0
            )

            response_text = "-"
            if plan.response_schemas:
                response_text = ", ".join(plan.response_schemas[:2])
                if len(plan.response_schemas) > 2:
                    response_text += "..."

            op_table.add_row(
                str(row_num),
                path,
                method.upper(),
                operation_id,
                plan.tag,
                str(path_params_count) if path_params_count > 0 else "-",
                str(query_params_count) if query_params_count > 0 else "-",
                plan.request_body_schema or "-",
                response_text,
            )

            row_num += 1

    console.print(op_table)
