"""Tests for versioned package paths."""

from pathlib import Path
from dart.package.paths import build_package_paths, get_versioned_import_path


def test_build_package_paths_v1():
    """Test building package paths for v1 version."""
    package_root = Path("packages/dart")
    version_folder = "v1"

    paths = build_package_paths(package_root, version_folder)

    assert paths.package_root == package_root
    assert paths.lib_root == package_root / "lib"
    assert paths.version_lib == package_root / "lib" / "v1"
    assert paths.docs_root == package_root / "doc"
    assert paths.version_docs == package_root / "doc" / "v1"
    assert paths.pubspec_file == package_root / "pubspec.yaml"
    assert paths.readme_file == package_root / "README.md"
    # Root-level entry files are no longer generated
    # assert paths.root_entry_file == package_root / "lib" / "dart.dart"
    # assert paths.version_entry_file == package_root / "lib" / "v1.dart"
    # assert paths.latest_entry_file == package_root / "lib" / "latest.dart"
    assert paths.version_index_file == package_root / "lib" / "v1" / "index.dart"


def test_build_package_paths_latest():
    """Test building package paths for latest version."""
    package_root = Path("packages/dart")
    version_folder = "latest"

    paths = build_package_paths(package_root, version_folder)

    assert paths.package_root == package_root
    assert paths.lib_root == package_root / "lib"
    assert paths.version_lib == package_root / "lib" / "latest"
    assert paths.docs_root == package_root / "doc"
    assert paths.version_docs == package_root / "doc" / "latest"


def test_get_versioned_import_path():
    """Test building versioned import paths."""
    package_name = "riderescue_api"
    version_folder = "v1"
    relative_path = Path("models/user/index.dart")

    import_path = get_versioned_import_path(package_name, version_folder, relative_path)

    assert import_path == "package:riderescue_api/v1/models/user/index.dart"
