"""
Dart generation plan validation.

This module validates completed DartGenerationPlan objects before rendering.

This module must not:
- build generation plans
- render files
- inspect raw OpenAPI deeply
- write files
"""

from typing import Any

from constants.dart_syntax import (
    ENUM_FILE_NAME,
    FIELDS_FILE_NAME,
    INDEX_FILE_NAME,
    MODEL_FILE_NAME,
)
from constants.sdk_usage import SDK_USAGE_RESPONSE, SDK_USAGE_SHARED_ERROR
from logger import get_logger

log = get_logger(__name__)


def validate_generation_plan(plan: Any) -> None:
    """Validate the generation plan before rendering."""
    validate_class_plans(plan)
    validate_enum_plans(plan)
    validate_response_plans(plan)
    validate_route_plans(plan)
    validate_feature_plans(plan)


def validate_class_plans(plan: Any) -> None:
    """Validate class artifact folders and required class plan paths."""
    artifact_folders: dict[str, str] = {}

    for schema_name, class_plan in plan.classes.items():
        validate_class_plan_shape(class_plan)

        folder_str = str(class_plan.artifact_folder)

        if folder_str in artifact_folders:
            raise ValueError(
                "Duplicate artifact folder: " f"{folder_str} used by both " f"{artifact_folders[folder_str]} and {schema_name}"
            )

        artifact_folders[folder_str] = schema_name


def validate_class_plan_shape(class_plan: Any) -> None:
    """Validate required class plan attributes exist."""
    required_attrs = [
        "artifact_folder",
        "model_path",
        "fields_path",
        "index_path",
        "class_name",
    ]

    for attr in required_attrs:
        if not hasattr(class_plan, attr):
            class_name = getattr(class_plan, "class_name", "<unknown>")
            raise ValueError(f"Class plan missing {attr}: {class_name}")

    if class_plan.model_path.name != MODEL_FILE_NAME:
        raise ValueError(f"Class model path must end with {MODEL_FILE_NAME}: {class_plan.model_path}")

    if class_plan.fields_path.name != FIELDS_FILE_NAME:
        raise ValueError(f"Class fields path must end with {FIELDS_FILE_NAME}: {class_plan.fields_path}")

    if class_plan.index_path.name != INDEX_FILE_NAME:
        raise ValueError(f"Class index path must end with {INDEX_FILE_NAME}: {class_plan.index_path}")

    if class_plan.model_path.parent != class_plan.artifact_folder:
        raise ValueError(f"{MODEL_FILE_NAME} is not inside artifact folder: {class_plan.class_name}")

    if class_plan.fields_path.parent != class_plan.artifact_folder:
        raise ValueError(f"{FIELDS_FILE_NAME} is not inside artifact folder: {class_plan.class_name}")

    if class_plan.index_path.parent != class_plan.artifact_folder:
        raise ValueError(f"{INDEX_FILE_NAME} is not inside artifact folder: {class_plan.class_name}")


def validate_enum_plans(plan: Any) -> None:
    """Validate enum output paths."""
    for enum_plan in plan.enums.values():
        path_str = str(enum_plan.output_path)

        if not path_str.endswith(ENUM_FILE_NAME):
            raise ValueError(f"Enum file must use {ENUM_FILE_NAME}: {path_str}")


def validate_response_plans(plan: Any) -> None:
    """Warn when response-like plans unexpectedly have no fields."""
    for class_plan in plan.classes.values():
        if class_plan.usage_type not in {SDK_USAGE_RESPONSE, SDK_USAGE_SHARED_ERROR}:
            continue

        if not class_plan.source_schema:
            continue

        if len(class_plan.fields) == 0:
            log.warning(
                "%s (usage=%s) has no fields but source schema %s might have properties",
                class_plan.class_name,
                class_plan.usage_type,
                class_plan.source_schema,
            )


def validate_route_plans(plan: Any) -> None:
    """Validate route endpoint plans."""
    for version in plan.route_versions:
        for group in version.endpoint_groups:
            for operation in group.operations:
                if not operation.method_name:
                    raise ValueError(f"Endpoint operation missing method name: {operation.operation_id}")


def validate_feature_plans(plan: Any) -> None:
    """Validate feature method plans."""
    for feature in plan.features:
        for method in feature.methods:
            if not method.endpoint_expr:
                raise ValueError(f"Feature method {method.method_name} has empty endpoint expression")

            if not method.response_class:
                raise ValueError(f"Feature method {method.method_name} has empty response class")
