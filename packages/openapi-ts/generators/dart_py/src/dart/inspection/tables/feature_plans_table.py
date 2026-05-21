"""
Feature plans table printer.
"""

from rich.table import Table

from logger import console
from ..models import DartInspection


def print_feature_plans_table(inspection: DartInspection) -> None:
    """Print feature plans and methods tables."""
    plans = inspection.plans

    if not plans.features:
        return

    feature_table = Table(title="Feature Plans")
    feature_table.add_column("#", style="dim")
    feature_table.add_column("Version", style="dim")
    feature_table.add_column("Group", style="magenta")
    feature_table.add_column("Class", style="yellow")
    feature_table.add_column("Provider", style="green")
    feature_table.add_column("Folder", style="dim")
    feature_table.add_column("File", style="cyan")
    feature_table.add_column("Methods", style="blue")

    for index, feature in enumerate(plans.features, 1):
        feature_table.add_row(
            str(index),
            feature.version_name,
            feature.group_name,
            feature.class_name,
            feature.provider_name,
            str(feature.folder),
            feature.file_name,
            str(len(feature.methods)),
        )

    console.print(feature_table)

    method_table = Table(title="Feature Methods")
    method_table.add_column("#", style="dim")
    method_table.add_column("Feature", style="magenta")
    method_table.add_column("Method", style="yellow")
    method_table.add_column("Request", style="green")
    method_table.add_column("Response", style="cyan")
    method_table.add_column("Endpoint", style="blue")

    row_num = 1
    for feature in plans.features:
        for method in feature.methods:
            endpoint_expr = method.endpoint_expr
            method_table.add_row(
                str(row_num),
                feature.class_name,
                method.method_name,
                method.request_class,
                method.response_class,
                endpoint_expr[:50] + "..." if len(endpoint_expr) > 50 else endpoint_expr,
            )
            row_num += 1

    console.print(method_table)
