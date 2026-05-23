"""Test that feature templates use flutter_api_bridge imports."""

from paths.project_paths import get_templates_dir


def test_feature_template_imports_flutter_api_bridge():
    """Verify feature template imports flutter_api_bridge."""
    templates_dir = get_templates_dir()
    feature_template = templates_dir / "dart" / "features" / "feature.dart.j2"

    assert feature_template.exists(), "feature.dart.j2 template should exist"

    content = feature_template.read_text()

    # The template should use plan.imports which includes flutter_api_bridge
    # Check that the template loops through imports
    assert "{%- for import in plan.imports %}" in content, "Feature template should loop through plan.imports"
    assert "import '{{ import }}';" in content, "Feature template should render imports"


def test_feature_constants_import_flutter_api_bridge():
    """Verify feature constants include flutter_api_bridge import."""
    from constants.features import FLUTTER_API_BRIDGE_IMPORT

    assert (
        FLUTTER_API_BRIDGE_IMPORT == "package:flutter_api_bridge/flutter_api_bridge.dart"
    ), "FLUTTER_API_BRIDGE_IMPORT should point to flutter_api_bridge package"


def test_feature_constants_no_old_client_imports():
    """Verify feature constants do not include old client imports."""
    from constants.features import (
        API_REQUEST_IMPORT,
        API_REQUEST_OPTIONS_IMPORT,
        API_RESULT_IMPORT,
    )

    # All should point to flutter_api_bridge, not internal client
    assert "flutter_api_bridge" in API_REQUEST_IMPORT, "API_REQUEST_IMPORT should use flutter_api_bridge"
    assert "flutter_api_bridge" in API_REQUEST_OPTIONS_IMPORT, "API_REQUEST_OPTIONS_IMPORT should use flutter_api_bridge"
    assert "flutter_api_bridge" in API_RESULT_IMPORT, "API_RESULT_IMPORT should use flutter_api_bridge"

    # Should not contain old client paths
    assert "/client/" not in API_REQUEST_IMPORT, "API_REQUEST_IMPORT should not reference internal client"
    assert "/client/" not in API_REQUEST_OPTIONS_IMPORT, "API_REQUEST_OPTIONS_IMPORT should not reference internal client"
    assert "/client/" not in API_RESULT_IMPORT, "API_RESULT_IMPORT should not reference internal client"


def test_feature_template_uses_bridge_types():
    """Verify feature template uses bridge request types."""
    templates_dir = get_templates_dir()
    feature_template = templates_dir / "dart" / "features" / "feature.dart.j2"
    content = feature_template.read_text()

    # Should use apiProvider from bridge
    assert "apiProvider" in content, "Feature template should use apiProvider"

    # Should use request classes from bridge (via method.request_class)
    assert "{{ method.request_class }}" in content, "Feature template should use request_class from plan"

    # Should not include version parameter (removed from bridge)
    assert "version:" not in content.lower(), "Feature template should not include version parameter"
