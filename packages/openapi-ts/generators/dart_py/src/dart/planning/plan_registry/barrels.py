"""
Barrel export planning.
"""

from pathlib import Path
from typing import Any

from constants.dart_syntax import (
    DART_DTOS_FOLDER,
    DART_ENUMS_FOLDER,
    DART_EXPORT_FIELDS,
    DART_EXPORT_MODEL,
    DART_FEATURES_ROOT,
    DART_INDEX_FILE_NAME,
    DART_MODELS_FOLDER,
    DART_PATH_SEPARATOR,
    DART_RESPONSE_FOLDER_PREFIX,
    DART_SHARED_FOLDER,
)
from constants.sdk_usage import (
    SDK_OPERATION_DTO_USAGES,
    SDK_USAGE_MODEL,
    SDK_USAGE_SHARED,
    SDK_USAGE_SHARED_ERROR,
)
from .models import DartBarrelPlan
from ..feature_plan import DartFeaturePlan


def build_barrel_plans(
    class_plans: dict[str, Any],
    enum_plans: dict[str, Any],
    features: list[DartFeaturePlan],
) -> list[DartBarrelPlan]:
    """Build all barrel export plans."""
    barrel_plans: list[DartBarrelPlan] = []

    barrel_plans.extend(build_class_artifact_barrels(class_plans))
    barrel_plans.extend(build_enum_barrels(enum_plans))
    barrel_plans.extend(build_operation_barrels(class_plans))
    barrel_plans.extend(build_shared_response_barrels(class_plans))
    barrel_plans.extend(build_category_barrels(class_plans, enum_plans))
    barrel_plans.extend(build_feature_barrels(features))

    return dedupe_barrel_plans(barrel_plans)


def build_class_artifact_barrels(
    class_plans: dict[str, Any],
) -> list[DartBarrelPlan]:
    barrels: list[DartBarrelPlan] = []

    for plan in class_plans.values():
        barrels.append(
            DartBarrelPlan(
                output_path=plan.artifact_folder / DART_INDEX_FILE_NAME,
                exports=[DART_EXPORT_FIELDS, DART_EXPORT_MODEL],
            )
        )

    return barrels


def build_enum_barrels(
    enum_plans: dict[str, Any],
) -> list[DartBarrelPlan]:
    enum_folder_files: dict[Path, list[str]] = {}

    for plan in enum_plans.values():
        folder = plan.output_path.parent
        enum_folder_files.setdefault(folder, []).append(plan.output_path.name)

    barrels: list[DartBarrelPlan] = []

    for folder, files in enum_folder_files.items():
        barrels.append(
            DartBarrelPlan(
                output_path=folder / DART_INDEX_FILE_NAME,
                exports=sorted(set(files)),
            )
        )

    return barrels


def build_operation_barrels(
    class_plans: dict[str, Any],
) -> list[DartBarrelPlan]:
    operation_folders: dict[Path, list[str]] = {}

    for plan in class_plans.values():
        if plan.operation_id and plan.usage_type in SDK_OPERATION_DTO_USAGES:
            operation_folder = plan.artifact_folder.parent
            role_folder = plan.artifact_folder.name
            operation_folders.setdefault(operation_folder, []).append(f"{role_folder}/{DART_INDEX_FILE_NAME}")

    return [
        DartBarrelPlan(
            output_path=folder / DART_INDEX_FILE_NAME,
            exports=sorted(set(exports)),
        )
        for folder, exports in operation_folders.items()
    ]


def build_shared_response_barrels(
    class_plans: dict[str, Any],
) -> list[DartBarrelPlan]:
    exports: list[str] = []

    for plan in class_plans.values():
        if plan.usage_type == SDK_USAGE_SHARED_ERROR and plan.status_code:
            exports.append(f"{DART_RESPONSE_FOLDER_PREFIX}{plan.status_code}/{DART_INDEX_FILE_NAME}")

    if not exports:
        return []

    shared_responses_folder = Path(DART_DTOS_FOLDER) / DART_SHARED_FOLDER / "responses"

    return [
        DartBarrelPlan(
            output_path=shared_responses_folder / DART_INDEX_FILE_NAME,
            exports=sorted(set(exports)),
        )
    ]


def build_category_barrels(
    class_plans: dict[str, Any],
    enum_plans: dict[str, Any],
) -> list[DartBarrelPlan]:
    category_exports: dict[Path, list[str]] = {
        Path(DART_MODELS_FOLDER): [],
        Path(DART_DTOS_FOLDER): [],
        Path(DART_ENUMS_FOLDER): [],
    }

    for plan in class_plans.values():
        if plan.usage_type == SDK_USAGE_MODEL:
            category_exports[Path(DART_MODELS_FOLDER)].append(relative_index_export(plan.artifact_folder, DART_MODELS_FOLDER))

        elif (
            plan.usage_type in SDK_OPERATION_DTO_USAGES or plan.usage_type == SDK_USAGE_SHARED or plan.usage_type == SDK_USAGE_SHARED_ERROR
        ):
            category_exports[Path(DART_DTOS_FOLDER)].append(relative_index_export(plan.artifact_folder, DART_DTOS_FOLDER))

    enum_folders = {plan.output_path.parent for plan in enum_plans.values()}

    for folder in enum_folders:
        category_exports[Path(DART_ENUMS_FOLDER)].append(relative_index_export(folder, DART_ENUMS_FOLDER))

    barrels: list[DartBarrelPlan] = []

    for category, exports in category_exports.items():
        if exports:
            barrels.append(
                DartBarrelPlan(
                    output_path=category / DART_INDEX_FILE_NAME,
                    exports=sorted(set(exports)),
                )
            )

    return barrels


def build_feature_barrels(
    features: list[DartFeaturePlan],
) -> list[DartBarrelPlan]:
    feature_version_folders: dict[Path, list[str]] = {}

    for feature in features:
        feature_version_folders.setdefault(feature.folder, []).append(feature.file_name)

    barrels: list[DartBarrelPlan] = []

    for folder, files in feature_version_folders.items():
        barrels.append(
            DartBarrelPlan(
                output_path=folder / DART_INDEX_FILE_NAME,
                exports=sorted(set(files)),
            )
        )

    if feature_version_folders:
        version_exports = [relative_index_export(folder, DART_FEATURES_ROOT) for folder in feature_version_folders.keys()]

        barrels.append(
            DartBarrelPlan(
                output_path=Path(DART_FEATURES_ROOT) / DART_INDEX_FILE_NAME,
                exports=sorted(set(version_exports)),
            )
        )

    return barrels


def relative_index_export(folder: Path, root: str) -> str:
    """Return normalized relative index export path."""
    return normalize_path(folder.relative_to(root) / DART_INDEX_FILE_NAME)


def normalize_path(path: Path) -> str:
    """Normalize a path for Dart export/import strings."""
    return str(path).replace("\\", DART_PATH_SEPARATOR)


def dedupe_barrel_plans(
    barrel_plans: list[DartBarrelPlan],
) -> list[DartBarrelPlan]:
    """Dedupe barrels by output path and merge exports."""
    merged: dict[Path, set[str]] = {}

    for plan in barrel_plans:
        merged.setdefault(plan.output_path, set()).update(plan.exports)

    return [
        DartBarrelPlan(
            output_path=path,
            exports=sorted(exports),
        )
        for path, exports in sorted(merged.items(), key=lambda item: str(item[0]))
    ]
