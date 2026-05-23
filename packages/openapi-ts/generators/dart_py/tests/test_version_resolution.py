"""Tests for version resolution."""

from dart.package.version import resolve_api_version_folder


def test_resolve_api_version_folder_v1():
    """Test resolving v1 version folder."""
    spec = {
        "info": {
            "version": "1.0.0",
        },
    }
    
    assert resolve_api_version_folder(spec) == "v1"


def test_resolve_api_version_folder_v2():
    """Test resolving v2 version folder."""
    spec = {
        "info": {
            "version": "2.0.0",
        },
    }
    
    assert resolve_api_version_folder(spec) == "v2"


def test_resolve_api_version_folder_latest():
    """Test resolving latest version folder for non-standard versions."""
    spec = {
        "info": {
            "version": "beta",
        },
    }
    
    assert resolve_api_version_folder(spec) == "latest"


def test_resolve_api_version_folder_no_version():
    """Test resolving latest version folder when no version is present."""
    spec = {
        "info": {},
    }
    
    assert resolve_api_version_folder(spec) == "latest"


def test_resolve_api_version_folder_patch_versions():
    """Test that patch versions map to major version folder."""
    spec = {
        "info": {
            "version": "1.2.3",
        },
    }
    
    assert resolve_api_version_folder(spec) == "v1"
