"""Tests for package metadata resolution."""

from dart.package.metadata import (
    extract_package_metadata,
    resolve_package_name,
    sanitize_package_name,
)


def test_sanitize_package_name():
    """Test package name sanitization."""
    assert sanitize_package_name("My API") == "my_api"
    assert sanitize_package_name("My-API") == "my_api"
    assert sanitize_package_name("My API v1") == "my_api_v1"
    assert sanitize_package_name("123API") == "api"  # Leading numbers are removed
    assert sanitize_package_name("my_api") == "my_api"
    assert sanitize_package_name("My API@#$") == "my_api"


def test_resolve_package_name():
    """Test resolving package name from spec."""
    spec = {
        "info": {
            "title": "RideRescue API",
        },
    }

    assert resolve_package_name(spec) == "riderescue_api"

    spec_with_codegen = {
        "info": {
            "title": "RideRescue API",
            "x-codegen": {
                "packageName": "custom_name",
            },
        },
    }

    assert resolve_package_name(spec_with_codegen) == "custom_name"


def test_extract_package_metadata():
    """Test extracting package metadata from OpenAPI spec."""
    spec = {
        "info": {
            "title": "RideRescue API",
            "description": "RideRescue API description",
            "version": "1.0.0",
        },
        "servers": [
            {"url": "https://api.example.com"},
            {"url": "https://staging.example.com"},
        ],
        "tags": [
            {"name": "users"},
            {"name": "rides"},
        ],
    }

    metadata = extract_package_metadata(spec)

    assert metadata.name == "riderescue_api"
    assert metadata.title == "RideRescue API"
    assert metadata.description == "RideRescue API description"
    assert metadata.version == "1.0.0"
    assert len(metadata.servers) == 2
    assert metadata.servers[0] == "https://api.example.com"
    assert len(metadata.tags) == 2
    assert metadata.tags[0] == "users"


def test_extract_package_metadata_defaults():
    """Test extracting package metadata with defaults."""
    spec = {
        "info": {
            "title": "Test API",
        },
    }

    metadata = extract_package_metadata(spec)

    assert metadata.name == "test_api"
    assert metadata.title == "Test API"
    assert metadata.description is None
    assert metadata.version == "1.0.0"
    assert metadata.servers == []
    assert metadata.tags == []
