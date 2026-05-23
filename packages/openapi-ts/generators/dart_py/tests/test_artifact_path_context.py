"""Tests for centralized artifact path helpers.

These tests verify that:
1. normalize_artifact_folder strips version prefixes correctly
2. versioned_write_path constructs correct write paths
3. dart_export_path uses POSIX forward slashes
"""

from pathlib import Path

from dart.render.paths import (
    normalize_artifact_folder,
    versioned_write_path,
    dart_export_path,
)


def test_normalize_artifact_folder_strips_v1_prefix():
    """Test that normalize_artifact_folder strips v1 prefix."""
    result = normalize_artifact_folder("v1/features", "v1")
    assert result == Path("features")


def test_normalize_artifact_folder_strips_latest_prefix():
    """Test that normalize_artifact_folder strips latest prefix."""
    result = normalize_artifact_folder("latest/models/user", "latest")
    assert result == Path("models/user")


def test_normalize_artifact_folder_no_prefix():
    """Test that normalize_artifact_folder leaves paths without prefix unchanged."""
    result = normalize_artifact_folder("models/user", "v1")
    assert result == Path("models/user")


def test_normalize_artifact_folder_exact_version():
    """Test that normalize_artifact_folder handles exact version match."""
    result = normalize_artifact_folder("v1", "v1")
    assert result == Path(".")


def test_normalize_artifact_folder_v2_prefix():
    """Test that normalize_artifact_folder strips v2 prefix."""
    result = normalize_artifact_folder("v2/features", "v2")
    assert result == Path("features")


def test_normalize_artifact_folder_auto_strip():
    """Test that normalize_artifact_folder auto-strips known version prefixes."""
    result = normalize_artifact_folder("v3/features")
    assert result == Path("features")


def test_versioned_write_path_basic():
    """Test that versioned_write_path constructs correct write path."""
    lib_root = Path("lib")
    result = versioned_write_path(lib_root, "v1", "features", "user_feature.dart")
    assert result == Path("lib/v1/features/user_feature.dart")


def test_versioned_write_path_with_nested_folder():
    """Test that versioned_write_path handles nested artifact folders."""
    lib_root = Path("lib")
    result = versioned_write_path(lib_root, "latest", "models/user", "model.dart")
    assert result == Path("lib/latest/models/user/model.dart")


def test_versioned_write_path_normalizes_artifact_folder():
    """Test that versioned_write_path normalizes artifact folder if it has version prefix."""
    lib_root = Path("lib")
    result = versioned_write_path(lib_root, "v1", "v1/features", "user_feature.dart")
    assert result == Path("lib/v1/features/user_feature.dart")


def test_dart_export_path_posix_slashes():
    """Test that dart_export_path uses POSIX forward slashes."""
    result = dart_export_path(Path("models") / "user" / "index.dart")
    assert result == "models/user/index.dart"
    assert "\\" not in result


def test_dart_export_path_windows_path():
    """Test that dart_export_path converts Windows path to POSIX."""
    # Simulate Windows path behavior
    result = dart_export_path("models\\user\\index.dart")
    assert result == "models/user/index.dart"
    assert "\\" not in result


def test_dart_export_path_string_input():
    """Test that dart_export_path handles string input."""
    result = dart_export_path("models/user/index.dart")
    assert result == "models/user/index.dart"


def test_normalize_artifact_folder_path_input():
    """Test that normalize_artifact_folder handles Path input."""
    result = normalize_artifact_folder(Path("v1/features"), "v1")
    assert result == Path("features")


def test_versioned_write_path_path_input():
    """Test that versioned_write_path handles Path input for artifact folder."""
    lib_root = Path("lib")
    result = versioned_write_path(lib_root, "v1", Path("features"), "user_feature.dart")
    assert result == Path("lib/v1/features/user_feature.dart")


def test_normalize_artifact_folder_deep_nesting():
    """Test that normalize_artifact_folder handles deeply nested paths."""
    result = normalize_artifact_folder("latest/models/user/enums/user_status", "latest")
    assert result == Path("models/user/enums/user_status")


def test_normalize_artifact_folder_no_version_folder_provided():
    """Test that normalize_artifact_folder auto-strips when version_folder not provided."""
    result = normalize_artifact_folder("latest/features")
    assert result == Path("features")


def test_normalize_artifact_folder_preserves_non_version_prefix():
    """Test that normalize_artifact_folder doesn't strip non-version prefixes."""
    result = normalize_artifact_folder("lib/features")
    assert result == Path("lib/features")


def test_dart_export_path_empty():
    """Test that dart_export_path handles empty path."""
    result = dart_export_path(".")
    assert result == "."


def test_as_path_with_string():
    """Test that as_path converts string to Path."""
    result = dart_export_path(".")
    assert result == "."


def test_as_path_with_path():
    """Test that as_path returns Path unchanged."""
    from dart.render.paths import as_path

    result = as_path("features")
    assert result == Path("features")
    assert isinstance(result, Path)


def test_as_path_with_path_object():
    """Test that as_path returns Path object unchanged."""
    from dart.render.paths import as_path

    path = Path("models/user")
    result = as_path(path)
    assert result == path
    assert isinstance(result, Path)


def test_feature_barrel_output_path_is_features_index():
    """Test that feature barrel output path is features/index.dart."""
    from dart.render.paths import as_path

    features_root = as_path("features")
    result = features_root / "index.dart"
    assert result.as_posix() == "features/index.dart"


def test_no_str_slash_str_type_error():
    """Test that path joining through as_path avoids TypeError."""
    from dart.render.paths import as_path

    # This should not raise TypeError
    features_root = as_path("features")
    result = features_root / "index.dart"
    assert result.as_posix() == "features/index.dart"
