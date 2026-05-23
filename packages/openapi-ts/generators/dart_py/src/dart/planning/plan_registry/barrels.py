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
    version_folder: str = "latest",
) -> list[DartBarrelPlan]:
    """Build all barrel export plans."""
    barrel_plans: list[DartBarrelPlan] = []

    barrel_plans.extend(build_class_artifact_barrels(class_plans, version_folder))
    barrel_plans.extend(build_enum_barrels(enum_plans, version_folder))
    barrel_plans.extend(build_operation_barrels(class_plans, version_folder))
    barrel_plans.extend(build_shared_response_barrels(class_plans, version_folder))
    barrel_plans.extend(build_category_barrels(class_plans, enum_plans, version_folder))
    barrel_plans.extend(build_feature_barrels(features, version_folder))

    return dedupe_barrel_plans(barrel_plans)


def build_class_artifact_barrels(
    class_plans: dict[str, Any],
    version_folder: str = "latest",
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
    version_folder: str = "latest",
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
    version_folder: str = "latest",
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
    version_folder: str = "latest",
) -> list[DartBarrelPlan]:
    exports: list[str] = []

    for plan in class_plans.values():
        if plan.usage_type == SDK_USAGE_SHARED_ERROR and plan.status_code:
            exports.append(f"{DART_RESPONSE_FOLDER_PREFIX}{plan.status_code}/{DART_INDEX_FILE_NAME}")

    if not exports:
        return []

    from ...render.paths import as_path

    shared_responses_folder = as_path(DART_DTOS_FOLDER) / DART_SHARED_FOLDER / "responses"

    return [
        DartBarrelPlan(
            output_path=shared_responses_folder / DART_INDEX_FILE_NAME,
            exports=sorted(set(exports)),
        )
    ]


def build_category_barrels(
    class_plans: dict[str, Any],
    enum_plans: dict[str, Any],
    version_folder: str = "latest",
) -> list[DartBarrelPlan]:
    category_exports: dict[Path, list[str]] = {
        Path(DART_MODELS_FOLDER): [],
        Path(DART_DTOS_FOLDER): [],
        Path(DART_ENUMS_FOLDER): [],
    }

    for plan in class_plans.values():
        if plan.usage_type == SDK_USAGE_MODEL:
            # artifact_folder is version-root-relative: models/shared/base_model
            # root is just models
            models_root = Path(DART_MODELS_FOLDER)
            category_exports[models_root].append(relative_index_export(plan.artifact_folder, models_root))

        elif (
            plan.usage_type in SDK_OPERATION_DTO_USAGES or plan.usage_type == SDK_USAGE_SHARED or plan.usage_type == SDK_USAGE_SHARED_ERROR
        ):
            # artifact_folder is version-root-relative: dtos/user/create_user/body
            # root is just dtos
            dtos_root = Path(DART_DTOS_FOLDER)
            category_exports[dtos_root].append(relative_index_export(plan.artifact_folder, dtos_root))

    # Enum barrels: enums are now under models/{resource}/enums/
    # Create barrels at the resource level, not top-level enums/
    enum_resource_folders: dict[Path, list[str]] = {}

    for plan in enum_plans.values():
        # output_path is version-root-relative: models/{resource}/enums/{enum_name}/enum.dart
        # We want to create models/{resource}/enums/index.dart
        # And also export from models/{resource}/index.dart
        enum_folder = plan.output_path.parent  # models/{resource}/enums/{enum_name}
        enums_subfolder = enum_folder.parent  # models/{resource}/enums
        resource_folder = enums_subfolder.parent  # models/{resource}

        # Add to enums subfolder barrel
        enum_export = f"{enum_folder.name}/{DART_INDEX_FILE_NAME}"
        enum_resource_folders.setdefault(enums_subfolder, []).append(enum_export)

        # Also track for resource-level barrel
        resource_export = f"{DART_ENUMS_FOLDER}/{DART_INDEX_FILE_NAME}"
        category_exports.setdefault(resource_folder, []).append(resource_export)

    barrels: list[DartBarrelPlan] = []

    # Create enums subfolder barrels (models/{resource}/enums/index.dart)
    for folder, exports in enum_resource_folders.items():
        barrels.append(
            DartBarrelPlan(
                output_path=folder / DART_INDEX_FILE_NAME,
                exports=sorted(set(exports)),
            )
        )

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
    version_folder: str = "latest",
) -> list[DartBarrelPlan]:
    from ...render.paths import normalize_artifact_folder, as_path

    feature_version_folders: dict[Path, list[str]] = {}

    for feature in features:
        # Normalize artifact folder to strip any accidental version prefix
        normalized_folder = normalize_artifact_folder(feature.folder, version_folder)
        feature_version_folders.setdefault(normalized_folder, []).append(feature.file_name)

    barrels: list[DartBarrelPlan] = []

    # Build per-feature barrel files (e.g., features/user/index.dart)
    for folder, files in feature_version_folders.items():
        barrels.append(
            DartBarrelPlan(
                output_path=folder / DART_INDEX_FILE_NAME,
                exports=sorted(set(files)),
            )
        )

    if feature_version_folders:
        # Build features/index.dart barrel
        # Exports should be relative to features/ folder
        features_root = as_path(DART_FEATURES_ROOT)
        feature_exports = []

        for folder in feature_version_folders.keys():
            # folder is now normalized to version-root-relative, e.g., "features" or "features/user"
            if folder == features_root:
                # Feature files are directly under features/, export them by name
                for file_name in feature_version_folders[folder]:
                    feature_exports.append(normalize_path(Path(file_name)))
            elif folder.is_relative_to(features_root):
                # Feature files are in subfolders, export the subfolder index
                folder_rel = folder.relative_to(features_root)
                feature_exports.append(normalize_path(folder_rel / DART_INDEX_FILE_NAME))
            else:
                raise ValueError(f"Feature artifact folder must be under {features_root}; got {folder}")

        barrels.append(
            DartBarrelPlan(
                output_path=features_root / DART_INDEX_FILE_NAME,
                exports=sorted(set(feature_exports)),
            )
        )

    return barrels


def relative_index_export(folder: Path, root: Path | str) -> str:
    """Return normalized relative index export path.

    Args:
        folder: The artifact folder path (must be version-root-relative, e.g., models/shared/base_model)
        root: The category root path (e.g., models, dtos, features)

    Returns:
        Normalized export path like 'shared/base_model/index.dart'

    Raises:
        ValueError: If folder is not under root, indicating version folder was incorrectly included
    """
    if isinstance(root, str):
        root = Path(root)

    if not folder.is_relative_to(root):
        raise ValueError(
            f"Cannot build barrel export: folder={folder} is not under root={root}. "
            "Artifact folders must be version-root-relative, e.g. models/..., not latest/models/..."
        )

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
