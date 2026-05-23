"""Test central project path resolution."""

from paths.project_paths import find_project_root, get_templates_dir


def test_get_templates_dir_returns_existing_directory():
    """Verify get_templates_dir() returns an existing directory."""
    templates_dir = get_templates_dir()
    assert templates_dir.is_dir(), "get_templates_dir() should return an existing directory"


def test_get_templates_dir_has_package_templates():
    """Verify templates directory contains expected package templates."""
    templates_dir = get_templates_dir()
    pubspec_template = templates_dir / "package" / "pubspec.yaml.j2"
    readme_template = templates_dir / "package" / "README.md.j2"

    assert pubspec_template.exists(), "pubspec.yaml.j2 should exist in templates"
    assert readme_template.exists(), "README.md.j2 should exist in templates"


def test_get_templates_dir_has_dart_templates():
    """Verify templates directory contains expected Dart templates."""
    templates_dir = get_templates_dir()
    feature_template = templates_dir / "dart" / "features" / "feature.dart.j2"
    class_template = templates_dir / "dart" / "class.dart.j2"

    assert feature_template.exists(), "feature.dart.j2 should exist in templates"
    assert class_template.exists(), "class.dart.j2 should exist in templates"


def test_no_parent_parent_template_lookup():
    """Verify no source files use parent.parent to locate templates."""
    root = find_project_root()
    offenders = []

    for path in [root / "src", root / "tests"]:
        if not path.exists():
            continue
        for file in path.rglob("*.py"):
            # Skip this test file itself and the centralized resolver
            if file.name in ("test_project_paths.py", "project_paths.py"):
                continue
            text = file.read_text(encoding="utf-8")
            if "parent.parent" in text and "templates" in text:
                offenders.append(str(file))

    assert offenders == [], f"Found files using parent.parent template lookup: {offenders}"
