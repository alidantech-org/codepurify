"""
Dart package metadata resolution from OpenAPI spec.

This module extracts and sanitizes package metadata from OpenAPI specifications
for generating a proper Dart package structure.
"""

import re
from dataclasses import dataclass
from typing import Any

from constants.openapi_keys import OPENAPI_INFO


@dataclass(frozen=True)
class DartPackageMetadata:
    """
    Dart package metadata extracted from OpenAPI spec.

    name:
        Sanitized Dart package name (snake_case, lowercase).

    title:
        Original API title from OpenAPI info.

    description:
        API description from OpenAPI info.

    version:
        API version string from OpenAPI info.

    servers:
        List of server URLs from OpenAPI spec.

    tags:
        List of tag names from OpenAPI spec.
    """

    name: str
    title: str
    description: str | None
    version: str
    servers: list[str]
    tags: list[str]


def resolve_package_name(spec: dict[str, Any]) -> str:
    """
    Resolve Dart package name from OpenAPI spec.

    Priority:
    1. info.x-codegen.packageName
    2. info.x-codegen.dartPackageName
    3. info.title
    4. fallback: generated_api

    Sanitization rules:
    - lowercase
    - snake_case
    - strip weird characters
    - remove leading numbers
    - collapse duplicate underscores
    - must be valid Dart package name
    """
    info = spec.get(OPENAPI_INFO, {})
    codegen = info.get("x-codegen", {})

    # Try codegen-specific package name
    package_name = codegen.get("packageName") or codegen.get("dartPackageName")

    # Fall back to title
    if not package_name:
        package_name = info.get("title", "generated_api")

    # Sanitize the package name
    return sanitize_package_name(package_name)


def sanitize_package_name(name: str) -> str:
    """
    Sanitize a string to be a valid Dart package name.

    Rules:
    - lowercase
    - snake_case
    - strip weird characters (only alphanumeric and underscore)
    - remove leading numbers
    - collapse duplicate underscores
    - strip leading/trailing underscores
    """
    # Convert to lowercase
    sanitized = name.lower()

    # Replace spaces and hyphens with underscores
    sanitized = re.sub(r"[\s-]+", "_", sanitized)

    # Remove any characters that are not alphanumeric or underscore
    sanitized = re.sub(r"[^a-z0-9_]", "", sanitized)

    # Remove leading numbers
    sanitized = re.sub(r"^[0-9_]+", "", sanitized)

    # Collapse duplicate underscores
    sanitized = re.sub(r"_{2,}", "_", sanitized)

    # Strip leading/trailing underscores
    sanitized = sanitized.strip("_")

    # If empty after sanitization, use fallback
    if not sanitized:
        sanitized = "generated_api"

    return sanitized


def extract_package_metadata(spec: dict[str, Any]) -> DartPackageMetadata:
    """
    Extract all package metadata from OpenAPI spec.
    """
    info = spec.get(OPENAPI_INFO, {})

    name = resolve_package_name(spec)
    title = info.get("title", "Generated API")
    description = info.get("description")
    version = info.get("version", "1.0.0")

    servers = []
    for server in spec.get("servers", []):
        if isinstance(server, dict):
            url = server.get("url")
            if url:
                servers.append(url)

    tags = []
    for tag in spec.get("tags", []):
        if isinstance(tag, dict):
            tag_name = tag.get("name")
            if tag_name:
                tags.append(tag_name)

    return DartPackageMetadata(
        name=name,
        title=title,
        description=description,
        version=version,
        servers=servers,
        tags=tags,
    )
