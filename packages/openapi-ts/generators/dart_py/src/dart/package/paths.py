"""
Dart package path resolution for versioned output.

This module defines the path structure for the Dart package with versioned folders.
"""

from pathlib import Path
from dataclasses import dataclass


@dataclass(frozen=True)
class DartPackagePaths:
    """
    Path structure for a versioned Dart package.

    package_root:
        Root directory of the Dart package (e.g., packages/dart).

    lib_root:
        lib directory under package root (e.g., packages/dart/lib).

    version_folder:
        Version folder name (e.g., v1, v2, latest).

    version_lib:
        Versioned lib directory (e.g., packages/dart/lib/v1).

    docs_root:
        docs directory under package root (e.g., packages/dart/doc).

    version_docs:
        Versioned docs directory (e.g., packages/dart/doc/v1).
    """

    package_root: Path
    lib_root: Path
    version_folder: str
    version_lib: Path
    docs_root: Path
    version_docs: Path

    @property
    def models_dir(self) -> Path:
        """Path to versioned models directory."""
        return self.version_lib / "models"

    @property
    def dtos_dir(self) -> Path:
        """Path to versioned dtos directory."""
        return self.version_lib / "dtos"

    @property
    def routes_dir(self) -> Path:
        """Path to versioned routes directory."""
        return self.version_lib / "routes"

    @property
    def features_dir(self) -> Path:
        """Path to versioned features directory."""
        return self.version_lib / "features"

    @property
    def root_entry_file(self) -> Path:
        """Path to root package entry file (lib/package_name.dart)."""
        return self.lib_root / f"{self.package_root.name}.dart"

    @property
    def version_entry_file(self) -> Path:
        """Path to version entry file (lib/v1.dart)."""
        return self.lib_root / f"{self.version_folder}.dart"

    @property
    def latest_entry_file(self) -> Path:
        """Path to latest entry file (lib/latest.dart)."""
        return self.lib_root / "latest.dart"

    @property
    def version_index_file(self) -> Path:
        """Path to version index file (lib/v1/index.dart)."""
        return self.version_lib / "index.dart"

    @property
    def pubspec_file(self) -> Path:
        """Path to pubspec.yaml."""
        return self.package_root / "pubspec.yaml"

    @property
    def readme_file(self) -> Path:
        """Path to README.md."""
        return self.package_root / "README.md"

    @property
    def analysis_options_file(self) -> Path:
        """Path to analysis_options.yaml."""
        return self.package_root / "analysis_options.yaml"

    @property
    def gitignore_file(self) -> Path:
        """Path to .gitignore."""
        return self.package_root / ".gitignore"

    @property
    def vscode_dir(self) -> Path:
        """Path to .vscode directory."""
        return self.package_root / ".vscode"

    @property
    def vscode_settings_file(self) -> Path:
        """Path to .vscode/settings.json."""
        return self.vscode_dir / "settings.json"


def build_package_paths(
    package_root: Path,
    version_folder: str,
) -> DartPackagePaths:
    """
    Build path structure for a versioned Dart package.

    Args:
        package_root: Root directory of the Dart package (e.g., packages/dart).
        version_folder: Version folder name (e.g., v1, v2, latest).

    Returns:
        DartPackagePaths with all computed paths.
    """
    lib_root = package_root / "lib"
    version_lib = lib_root / version_folder
    docs_root = package_root / "doc"
    version_docs = docs_root / version_folder

    return DartPackagePaths(
        package_root=package_root,
        lib_root=lib_root,
        version_folder=version_folder,
        version_lib=version_lib,
        docs_root=docs_root,
        version_docs=version_docs,
    )


def get_versioned_import_path(
    package_name: str,
    version_folder: str,
    relative_path: Path,
) -> str:
    """
    Generate a versioned import path for a Dart file.

    Args:
        package_name: Dart package name (e.g., riderescue_api).
        version_folder: Version folder name (e.g., v1, v2, latest).
        relative_path: Relative path from lib/v{version} to the file.

    Returns:
        Full import path including version prefix.

    Example:
        package_name="riderescue_api"
        version_folder="v1"
        relative_path=Path("models/user/user_public_model/index.dart")
        Returns: "package:riderescue_api/v1/models/user/user_public_model/index.dart"
    """
    return f"package:{package_name}/{version_folder}/{relative_path.as_posix()}"
