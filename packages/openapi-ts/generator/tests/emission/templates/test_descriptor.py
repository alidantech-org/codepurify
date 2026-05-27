"""Tests for template descriptor parsing with selector paths."""

from __future__ import annotations

from pathlib import Path

from src.emission.templates.descriptor import describe_template


def test_descriptor_extracts_selector_tokens():
    """Test that selector tokens are extracted from path segments."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("(models)/models/[name.path].txt.j2"))

    assert len(descriptor.selectors) == 1
    assert descriptor.selectors[0].expression == "models"


def test_descriptor_excludes_selector_from_output_parts():
    """Test that selector segments are removed from output path parts."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("(models)/models/[name.path].txt.j2"))

    assert descriptor.output_parts == ("models", "[name.path].txt.j2")
    assert "(models)" not in descriptor.output_parts


def test_descriptor_multiple_selectors():
    """Test that multiple selectors are extracted in order."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("(resources)/(operations)/[method]_[name.path].txt.j2"))

    assert len(descriptor.selectors) == 2
    assert descriptor.selectors[0].expression == "resources"
    assert descriptor.selectors[1].expression == "operations"


def test_descriptor_no_selectors_global():
    """Test that paths without selectors have empty selector tuple."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("summary.txt.j2"))

    assert len(descriptor.selectors) == 0
    assert descriptor.output_parts == ("summary.txt.j2",)


def test_descriptor_identifies_jinja_template():
    """Test that .j2 files are marked as templates."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("(models)/models/[name.path].txt.j2"))

    assert descriptor.is_template is True


def test_descriptor_identifies_raw_file():
    """Test that non-.j2 files are not marked as templates."""
    root = Path("/templates")
    descriptor = describe_template(root, Path(".gitignore"))

    assert descriptor.is_template is False


def test_descriptor_parses_segments():
    """Test that path segments are parsed into PathSegment objects."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("(models)/models/[name.path].txt.j2"))

    assert len(descriptor.segments) == 3
    assert descriptor.segments[0].is_selector is True
    assert descriptor.segments[1].is_static is True
    assert descriptor.segments[2].is_dynamic is True


def test_descriptor_escaped_segments_not_selectors():
    """Test that escaped ((...)) segments are not treated as selectors."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("docs/((not-selector))/page.txt.j2"))

    assert len(descriptor.selectors) == 0
    assert descriptor.output_parts == ("docs", "((not-selector))", "page.txt.j2")


def test_descriptor_dynamic_segment_not_selector():
    """Test that [...] dynamic segments are not treated as selectors."""
    root = Path("/templates")
    descriptor = describe_template(root, Path("lib/[version]/file.txt.j2"))

    assert len(descriptor.selectors) == 0
    assert descriptor.output_parts == ("lib", "[version]", "file.txt.j2")
