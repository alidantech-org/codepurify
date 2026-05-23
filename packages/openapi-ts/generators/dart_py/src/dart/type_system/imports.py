"""
Dart import management utilities.

This module computes, deduplicates, and sorts Dart import statements.
It handles both built-in types and package imports.

This module must not:
- decide class fields
- generate operation plans
- write files
- render templates
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Self

from constants.dart_syntax import DART_COLLECTION_IMPORT, format_package_import
from constants.dart_types import DART_CORE_TYPES


@dataclass(frozen=True, order=True)
class DartImport:
    uri: str

    @classmethod
    def from_package(cls, package_name: str, relative_path: str) -> Self:
        return cls(format_package_import(package_name, relative_path))

    @property
    def is_built_in(self) -> bool:
        return self.uri in DART_CORE_TYPES

    @property
    def is_collection(self) -> bool:
        return self.uri == DART_COLLECTION_IMPORT


def dedupe_imports(imports: list[DartImport]) -> list[DartImport]:
    seen = set()
    unique = []

    for imp in imports:
        if imp.uri not in seen:
            seen.add(imp.uri)
            unique.append(imp)

    return sorted(unique)


def needs_collection_import(has_list: bool = False, has_map: bool = False, has_set: bool = False) -> bool:
    return has_list or has_map or has_set


def package_import(
    package_name: str,
    version_folder: str,
    artifact_folder: Path | str,
    file_name: str = "index.dart",
) -> str:
    """
    Build a versioned package import URI.

    Args:
        package_name: Package name (e.g., "riderescue_api")
        version_folder: Version folder (e.g., "v1", "latest")
        artifact_folder: Artifact folder path (e.g., "dtos/user/list_users/query")
        file_name: File name to import (default: "index.dart")

    Returns:
        Package import URI like "package:riderescue_api/v1/dtos/user/list_users/query/index.dart"
    """
    artifact = Path(artifact_folder)
    relative_path = (artifact / file_name).as_posix()
    return f"package:{package_name}/{version_folder}/{relative_path}"
