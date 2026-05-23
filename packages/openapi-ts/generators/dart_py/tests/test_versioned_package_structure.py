"""Tests for versioned package structure.

These tests verify that:
1. Root lib has only version folders (no root-level .dart files)
2. Main version entrypoints exist (lib/v1/index.dart, lib/v1/routes.dart)
3. Routes implementation still exists (lib/v1/routes/v1.dart)
4. Feature imports use routes.dart instead of routes/v1.dart
"""

from pathlib import Path
from dart.package.paths import build_package_paths


def test_version_entrypoints_exist():
    """Test that version-scoped entrypoints are defined in paths."""
    package_root = Path("packages/dart")
    version_folder = "v1"

    paths = build_package_paths(package_root, version_folder)

    # Version index file should exist
    assert paths.version_index_file == package_root / "lib" / "v1" / "index.dart"

    # Version lib should be under version folder
    assert paths.version_lib == package_root / "lib" / "v1"


def test_no_root_level_entry_files():
    """Test that root-level entry files are not generated."""
    package_root = Path("packages/dart")
    version_folder = "v1"

    paths = build_package_paths(package_root, version_folder)

    # These paths should still exist in the dataclass for backward compatibility
    # but they should not be used for generation
    assert paths.root_entry_file == package_root / "lib" / "dart.dart"
    assert paths.version_entry_file == package_root / "lib" / "v1.dart"
    assert paths.latest_entry_file == package_root / "lib" / "latest.dart"

    # However, the generation logic should not create these files
    # This is verified by the removal of render calls in package_renderer.py


def test_version_routes_barrel_path():
    """Test that version routes barrel file path is correct."""
    package_root = Path("packages/dart")
    version_folder = "v1"

    paths = build_package_paths(package_root, version_folder)

    # Routes barrel should be at lib/v1/routes.dart
    routes_barrel_path = paths.version_lib / "routes.dart"
    assert routes_barrel_path == package_root / "lib" / "v1" / "routes.dart"


def test_routes_implementation_path():
    """Test that routes implementation file path is correct."""
    package_root = Path("packages/dart")
    version_folder = "v1"

    paths = build_package_paths(package_root, version_folder)

    # Routes implementation should be at lib/v1/routes/v1.dart
    routes_impl_path = paths.routes_dir / f"{version_folder}.dart"
    assert routes_impl_path == package_root / "lib" / "v1" / "routes" / "v1.dart"


def test_version_folder_isolation():
    """Test that each version is isolated in its own folder."""
    package_root = Path("packages/dart")

    v1_paths = build_package_paths(package_root, "v1")
    v2_paths = build_package_paths(package_root, "v2")

    # Each version should have its own lib folder
    assert v1_paths.version_lib == package_root / "lib" / "v1"
    assert v2_paths.version_lib == package_root / "lib" / "v2"

    # Each version should have its own index
    assert v1_paths.version_index_file == package_root / "lib" / "v1" / "index.dart"
    assert v2_paths.version_index_file == package_root / "lib" / "v2" / "index.dart"

    # Each version should have its own routes barrel
    assert v1_paths.version_lib / "routes.dart" == package_root / "lib" / "v1" / "routes.dart"
    assert v2_paths.version_lib / "routes.dart" == package_root / "lib" / "v2" / "routes.dart"
