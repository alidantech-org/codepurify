"""
Dart package version resolution from OpenAPI spec.

This module maps OpenAPI version strings to versioned folder names (v1, v2, latest).
"""

import re
from typing import Any

from constants.openapi_keys import OPENAPI_INFO

LATEST_VERSION = "latest"


def resolve_api_version_folder(spec: dict[str, Any]) -> str:
    """
    Resolve OpenAPI version to version folder name.

    Version folder rules:
    - 1.0.0 -> v1
    - v1 -> v1
    - 2.4.0 -> v2
    - invalid/missing -> latest

    Uses OpenAPI info.version as the source.
    """
    info = spec.get(OPENAPI_INFO, {})
    version = info.get("version", "")

    if not version:
        return LATEST_VERSION

    # If version already starts with 'v', validate and return
    if version.lower().startswith("v"):
        # Extract the number after 'v'
        match = re.match(r"^v(\d+)", version.lower())
        if match:
            return f"v{match.group(1)}"
        return LATEST_VERSION

    # Try to parse semantic version (major.minor.patch)
    match = re.match(r"^(\d+)", version)
    if match:
        major = match.group(1)
        return f"v{major}"

    # Invalid version format
    return LATEST_VERSION


def get_version_folder_name(version_string: str) -> str:
    """
    Convert a version string to a folder name.

    Examples:
    - "1.0.0" -> "v1"
    - "2.4.0" -> "v2"
    - "v1" -> "v1"
    - "invalid" -> "latest"
    """
    if not version_string:
        return LATEST_VERSION

    # If already starts with 'v', validate and return
    if version_string.lower().startswith("v"):
        match = re.match(r"^v(\d+)", version_string.lower())
        if match:
            return f"v{match.group(1)}"
        return LATEST_VERSION

    # Try to parse semantic version
    match = re.match(r"^(\d+)", version_string)
    if match:
        major = match.group(1)
        return f"v{major}"

    return LATEST_VERSION
