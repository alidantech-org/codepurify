"""Tests for versioned barrel path handling.

These tests verify that:
1. Plan artifact folders are version-root-relative (no latest/v1 prefix)
2. Renderer prepends lib/{version} exactly once at write time
3. Barrel exports use correct relative paths
4. No double version prefixes occur (e.g., latest/latest)
"""

from pathlib import Path
import pytest

from dart.planning.plan_registry.barrels import relative_index_export
from dart.render.paths import (
    enum_output_path,
    model_output_path,
    dto_body_output_path,
)


def test_enum_output_path_is_version_root_relative():
    """Test that enum_output_path returns version-root-relative path."""
    path = enum_output_path("user", "UserStatus")
    assert path.as_posix() == "models/user/enums/user_status/enum.dart"
    # Should not contain version folder
    assert not str(path).startswith("latest/")
    assert not str(path).startswith("v1/")


def test_model_output_path_is_version_root_relative():
    """Test that model_output_path returns version-root-relative path."""
    path = model_output_path("user", "BaseModel")
    assert path.as_posix() == "models/user/base_model/model.dart"
    # Should not contain version folder
    assert not str(path).startswith("latest/")
    assert not str(path).startswith("v1/")


def test_dto_body_output_path_is_version_root_relative():
    """Test that dto_body_output_path returns version-root-relative path."""
    path = dto_body_output_path("user", "create_user")
    assert path.as_posix() == "dtos/user/create_user/body.dart"
    # Should not contain version folder
    assert not str(path).startswith("latest/")
    assert not str(path).startswith("v1/")


def test_relative_index_export_with_valid_paths():
    """Test that relative_index_export works with version-root-relative paths."""
    # models/shared/base_model relative to models
    result = relative_index_export(
        Path("models/shared/base_model"),
        Path("models")
    )
    assert result == "shared/base_model/index.dart"

    # dtos/user/create_user relative to dtos
    result = relative_index_export(
        Path("dtos/user/create_user"),
        Path("dtos")
    )
    assert result == "user/create_user/index.dart"


def test_relative_index_export_with_version_prefix_raises_error():
    """Test that relative_index_export raises error when folder has version prefix."""
    with pytest.raises(ValueError) as exc_info:
        relative_index_export(
            Path("latest/models/shared/base_model"),
            Path("models")
        )
    
    assert "is not under root" in str(exc_info.value)
    assert "version-root-relative" in str(exc_info.value)


def test_relative_index_export_with_v1_prefix_raises_error():
    """Test that relative_index_export raises error when folder has v1 prefix."""
    with pytest.raises(ValueError) as exc_info:
        relative_index_export(
            Path("v1/models/shared/base_model"),
            Path("models")
        )
    
    assert "is not under root" in str(exc_info.value)
    assert "version-root-relative" in str(exc_info.value)


def test_relative_index_export_string_root():
    """Test that relative_index_export accepts string root."""
    result = relative_index_export(
        Path("models/shared/base_model"),
        "models"
    )
    assert result == "shared/base_model/index.dart"


def test_no_double_version_prefix_in_paths():
    """Test that path helpers never produce double version prefixes."""
    # Direct path helpers should never include version folder
    paths = [
        enum_output_path("user", "UserStatus"),
        model_output_path("user", "BaseModel"),
        dto_body_output_path("user", "create_user"),
    ]
    
    for path in paths:
        path_str = path.as_posix()
        # Should not have version prefix
        assert not path_str.startswith("latest/")
        assert not path_str.startswith("v1/")
        # Should not have double version prefix anywhere
        assert "latest/latest" not in path_str
        assert "v1/v1" not in path_str
        assert "latest/v1" not in path_str
        assert "v1/latest" not in path_str


def test_barrel_export_path_format():
    """Test that barrel export paths use forward slashes and index.dart."""
    result = relative_index_export(
        Path("models/shared/base_model"),
        Path("models")
    )
    
    # Should use forward slashes (Dart convention)
    assert "\\" not in result
    # Should end with index.dart
    assert result.endswith("index.dart")
    # Should be relative path
    assert not result.startswith("/")
