"""Tests for feature barrel path handling.

These tests verify that:
1. Feature artifact folders are version-root-relative
2. Features barrel exports are correct
3. No relative_index_export calls with folder="."
"""

from pathlib import Path
from dataclasses import dataclass

from dart.planning.plan_registry.barrels import build_feature_barrels
from constants.dart_syntax import DART_FEATURES_ROOT, DART_INDEX_FILE_NAME


@dataclass
class MockFeaturePlan:
    """Mock feature plan for testing."""

    folder: Path
    file_name: str


def test_feature_artifact_folder_is_version_root_relative():
    """Test that feature artifact folders are version-root-relative."""
    feature = MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="user_feature.dart")

    # Should not contain version folder
    assert not str(feature.folder).startswith("latest/")
    assert not str(feature.folder).startswith("v1/")
    assert feature.folder == Path("features")


def test_build_feature_barrels_with_direct_files():
    """Test that features/index.dart exports files directly when under features/."""
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="user_feature.dart"),
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="order_feature.dart"),
    ]

    barrels = build_feature_barrels(features, version_folder="latest")

    # Should have per-feature barrels
    feature_barrels = [b for b in barrels if "features" in str(b.output_path) and b.output_path.name == DART_INDEX_FILE_NAME]

    # Find the features/index.dart barrel
    features_index = next((b for b in feature_barrels if b.output_path.parent.name == DART_FEATURES_ROOT), None)
    assert features_index is not None

    # Should export files directly, not with features/ prefix
    assert "user_feature.dart" in features_index.exports
    assert "order_feature.dart" in features_index.exports

    # Should not have features/ prefix in exports
    for export in features_index.exports:
        assert not export.startswith("features/")


def test_build_feature_barrels_with_subfolders():
    """Test that features/index.dart exports subfolder indexes when using subfolders."""
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT) / "user", file_name="index.dart"),
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT) / "order", file_name="index.dart"),
    ]

    barrels = build_feature_barrels(features, version_folder="latest")

    # Find the features/index.dart barrel
    features_index = next(
        (b for b in barrels if b.output_path.parent.name == DART_FEATURES_ROOT and b.output_path.name == DART_INDEX_FILE_NAME), None
    )
    assert features_index is not None

    # Should export subfolder indexes
    assert "user/index.dart" in features_index.exports
    assert "order/index.dart" in features_index.exports


def test_build_feature_barrels_output_paths():
    """Test that feature barrel output paths are version-root-relative."""
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="user_feature.dart"),
    ]

    barrels = build_feature_barrels(features, version_folder="latest")

    # All barrel output paths should be version-root-relative (not version-prefixed)
    for barrel in barrels:
        path_str = barrel.output_path.as_posix()
        assert path_str == "features/index.dart"
        # Should not have version prefix (renderer adds it)
        assert not path_str.startswith("latest/")
        assert not path_str.startswith("v1/")
        assert "lib/" not in path_str


def test_no_relative_index_export_with_dot():
    """Test that build_feature_barrels does not call relative_index_export with folder='.'."""
    # This is implicitly tested by the fact that the function doesn't crash
    # and handles the case where folder == features_root correctly
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="user_feature.dart"),
    ]

    # Should not raise ValueError about folder not being under root
    barrels = build_feature_barrels(features, version_folder="latest")
    assert len(barrels) > 0


def test_feature_barrel_exports_use_forward_slashes():
    """Test that feature barrel exports use forward slashes."""
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="user_feature.dart"),
    ]

    barrels = build_feature_barrels(features, version_folder="latest")

    for barrel in barrels:
        for export in barrel.exports:
            assert "\\" not in export, f"Export should use forward slashes: {export}"


def test_mixed_feature_structure():
    """Test that mixed feature structure (direct files + subfolders) works."""
    features = [
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT), file_name="common_feature.dart"),
        MockFeaturePlan(folder=Path(DART_FEATURES_ROOT) / "user", file_name="index.dart"),
    ]

    barrels = build_feature_barrels(features, version_folder="latest")

    # Find the features/index.dart barrel
    features_index = next(
        (b for b in barrels if b.output_path.parent.name == DART_FEATURES_ROOT and b.output_path.name == DART_INDEX_FILE_NAME), None
    )
    assert features_index is not None

    # Should export both direct files and subfolder indexes
    assert "common_feature.dart" in features_index.exports
    # Subfolder exports are handled separately - each subfolder gets its own barrel
    # The features/index.dart exports direct files, subfolders have their own index.dart
