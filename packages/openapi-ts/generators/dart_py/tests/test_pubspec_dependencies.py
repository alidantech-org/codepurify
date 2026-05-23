"""Test that generated pubspec.yaml includes flutter_api_bridge dependency."""

from paths.project_paths import get_templates_dir


def test_pubspec_includes_flutter_api_bridge():
    """Verify pubspec.yaml template includes flutter_api_bridge dependency."""
    templates_dir = get_templates_dir()
    pubspec_template = templates_dir / "package" / "pubspec.yaml.j2"

    assert pubspec_template.exists(), "pubspec.yaml.j2 template should exist"

    content = pubspec_template.read_text()

    # Check for flutter_api_bridge dependency
    assert "flutter_api_bridge:" in content, "pubspec.yaml should include flutter_api_bridge dependency"
    assert "^0.1.0" in content, "flutter_api_bridge version should be ^0.1.0"

    # Check for Flutter SDK
    assert "flutter:" in content, "pubspec.yaml should include Flutter SDK"
    assert "sdk: flutter" in content, "Flutter should be marked as SDK dependency"

    # Check for flutter_riverpod
    assert "flutter_riverpod:" in content, "pubspec.yaml should include flutter_riverpod dependency"

    # Check environment constraints
    assert "flutter:" in content.lower(), "environment should include flutter constraint"
    assert "sdk:" in content, "environment should include sdk constraint"


def test_pubspec_uses_template_variables():
    """Verify pubspec.yaml uses template variables for package name."""
    templates_dir = get_templates_dir()
    pubspec_template = templates_dir / "package" / "pubspec.yaml.j2"
    content = pubspec_template.read_text()

    # Package name should come from template variable
    assert "{{ metadata.name }}" in content, "Package name should use metadata.name template variable"

    # Version should come from template variable
    assert "{{ metadata.version }}" in content, "Version should use metadata.version template variable"
