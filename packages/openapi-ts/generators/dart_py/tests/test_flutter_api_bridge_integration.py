"""Integration tests for flutter_api_bridge dependency."""

from paths.project_paths import get_src_dir, get_templates_dir


def test_dart_packages_constants_exist():
    """Verify dart_packages.py constants file exists with correct values."""
    src_dir = get_src_dir()
    dart_packages_file = src_dir / "constants" / "dart_packages.py"

    assert dart_packages_file.exists(), "dart_packages.py constants file should exist"

    # Import and verify constants
    import sys

    sys.path.insert(0, str(src_dir))

    from constants.dart_packages import (
        FLUTTER_API_BRIDGE_PACKAGE,
        FLUTTER_API_BRIDGE_VERSION,
        FLUTTER_API_BRIDGE_IMPORT,
    )

    assert FLUTTER_API_BRIDGE_PACKAGE == "flutter_api_bridge", "FLUTTER_API_BRIDGE_PACKAGE should be flutter_api_bridge"
    assert FLUTTER_API_BRIDGE_VERSION == "^0.1.0", "FLUTTER_API_BRIDGE_VERSION should be ^0.1.0"
    assert (
        FLUTTER_API_BRIDGE_IMPORT == "package:flutter_api_bridge/flutter_api_bridge.dart"
    ), "FLUTTER_API_BRIDGE_IMPORT should point to flutter_api_bridge.dart"


def test_feature_planning_uses_package_name():
    """Verify feature planning accepts and uses package_name parameter."""
    import sys

    src_dir = get_src_dir()
    sys.path.insert(0, str(src_dir))

    from dart.planning.plan_registry.features import build_feature_plans

    # Check that build_feature_plans accepts package_name parameter
    import inspect

    sig = inspect.signature(build_feature_plans)

    assert "package_name" in sig.parameters, "build_feature_plans should accept package_name parameter"

    # Check default value
    default_value = sig.parameters["package_name"].default
    assert default_value == "riderescue_api", "package_name should default to riderescue_api for backward compatibility"


def test_readme_includes_bridge_setup():
    """Verify README template includes flutter_api_bridge setup instructions."""
    templates_dir = get_templates_dir()
    readme_template = templates_dir / "package" / "README.md.j2"

    assert readme_template.exists(), "README.md.j2 template should exist"

    content = readme_template.read_text()

    # Should mention flutter_api_bridge
    assert "flutter_api_bridge" in content, "README should mention flutter_api_bridge"

    # Should include setup section
    assert "## Setup" in content, "README should include Setup section"

    # Should include Server.init example
    assert "Server.init" in content, "README should include Server.init example"

    # Should use OpenAPI servers if available
    assert "{% if metadata.servers %}" in content, "README should conditionally use OpenAPI servers"


def test_no_client_template_files():
    """Verify no client-related template files exist."""
    templates_dir = get_templates_dir()

    # Check for client directories
    for root, dirs, files in templates_dir.walk():
        # Skip __pycache__
        if "__pycache__" in str(root):
            continue

        # Check for client directories
        for dir_name in dirs:
            assert "client" not in dir_name.lower(), f"Template should not contain client directory: {root}/{dir_name}"

        # Check for client files
        for file_name in files:
            file_lower = file_name.lower()
            assert "client" not in file_lower, f"Template should not contain client file: {root}/{file_name}"
            assert "api_request" not in file_lower, f"Template should not contain api_request file: {root}/{file_name}"
            assert "api_provider" not in file_lower, f"Template should not contain api_provider file: {root}/{file_name}"
