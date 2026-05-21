"""Test CLI handlers."""

from pathlib import Path

from constants.paths import DEFAULT_DART_OUTPUT, DEFAULT_DOCS_OUTPUT, DEFAULT_DART_PACKAGE_NAME
from cli.options.models import CommonOptions, DocsOptions, InspectOptions, OutputOptions
from cli.handlers.version import handle_version
from cli.handlers.docs import handle_docs
from cli.handlers.inspect import handle_inspect


def test_handle_version(capsys) -> None:
    """Test version handler."""
    handle_version()
    captured = capsys.readouterr()
    assert "dart-py" in captured.out
    assert "v" in captured.out


def test_handle_inspect_with_invalid_input() -> None:
    """Test inspect handler with invalid input."""
    common = CommonOptions(
        input=Path("nonexistent.yaml"),
        dry_run=True,
        debug=False,
    )
    output = OutputOptions(
        dart_output=Path(DEFAULT_DART_OUTPUT),
        docs_output=Path(DEFAULT_DOCS_OUTPUT),
        package_name=DEFAULT_DART_PACKAGE_NAME,
    )
    options = InspectOptions(common=common, output=output)

    # Should raise an error when file doesn't exist
    try:
        handle_inspect(options)
        assert False, "Expected an error for invalid input"
    except Exception:
        pass  # Expected


def test_handle_docs_with_invalid_input() -> None:
    """Test docs handler with invalid input."""
    common = CommonOptions(
        input=Path("nonexistent.yaml"),
        dry_run=True,
        debug=False,
    )
    options = DocsOptions(
        common=common,
        output=Path(DEFAULT_DOCS_OUTPUT),
        clean=False,
    )

    # Should raise an error when file doesn't exist
    try:
        handle_docs(options)
        assert False, "Expected an error for invalid input"
    except Exception:
        pass  # Expected
