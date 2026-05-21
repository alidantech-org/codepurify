"""Test CLI option dataclasses."""

from pathlib import Path

from constants.paths import DEFAULT_DART_OUTPUT, DEFAULT_DOCS_OUTPUT, DEFAULT_DART_PACKAGE_NAME, DEFAULT_OPENAPI_INPUT
from cli.options.models import CommonOptions, DocsOptions, GenerateModeOptions, GenerateOptions, InspectOptions, OutputOptions


def test_common_options() -> None:
    """Test CommonOptions dataclass."""
    options = CommonOptions(
        input=Path(DEFAULT_OPENAPI_INPUT),
        dry_run=True,
        debug=False,
    )
    assert options.input == Path(DEFAULT_OPENAPI_INPUT)
    assert options.dry_run is True
    assert options.debug is False


def test_output_options() -> None:
    """Test OutputOptions dataclass."""
    options = OutputOptions(
        dart_output=Path(DEFAULT_DART_OUTPUT),
        docs_output=Path(DEFAULT_DOCS_OUTPUT),
        package_name=DEFAULT_DART_PACKAGE_NAME,
    )
    assert options.dart_output == Path(DEFAULT_DART_OUTPUT)
    assert options.docs_output == Path(DEFAULT_DOCS_OUTPUT)
    assert options.package_name == DEFAULT_DART_PACKAGE_NAME


def test_generate_mode_options() -> None:
    """Test GenerateModeOptions dataclass."""
    options = GenerateModeOptions(
        no_docs=False,
        no_dart=False,
        only_docs=True,
        only_dart=False,
        only_enums=False,
        only_fields=False,
        only_classes=False,
    )
    assert options.no_docs is False
    assert options.no_dart is False
    assert options.only_docs is True
    assert options.only_dart is False


def test_generate_options() -> None:
    """Test GenerateOptions dataclass."""
    common = CommonOptions(
        input=Path(DEFAULT_OPENAPI_INPUT),
        dry_run=True,
        debug=False,
    )
    output = OutputOptions(
        dart_output=Path(DEFAULT_DART_OUTPUT),
        docs_output=Path(DEFAULT_DOCS_OUTPUT),
        package_name=DEFAULT_DART_PACKAGE_NAME,
    )
    mode = GenerateModeOptions(
        no_docs=False,
        no_dart=False,
        only_docs=False,
        only_dart=False,
        only_enums=False,
        only_fields=False,
        only_classes=False,
    )
    options = GenerateOptions(
        common=common,
        output=output,
        mode=mode,
        clean=True,
        format=False,
        strict_format=False,
        tooling=False,
        force_tooling=False,
        interactive=False,
    )
    assert options.common == common
    assert options.output == output
    assert options.mode == mode
    assert options.clean is True
    assert options.format is False


def test_docs_options() -> None:
    """Test DocsOptions dataclass."""
    common = CommonOptions(
        input=Path(DEFAULT_OPENAPI_INPUT),
        dry_run=True,
        debug=False,
    )
    options = DocsOptions(
        common=common,
        output=Path(DEFAULT_DOCS_OUTPUT),
        clean=True,
    )
    assert options.common == common
    assert options.output == Path(DEFAULT_DOCS_OUTPUT)
    assert options.clean is True


def test_inspect_options() -> None:
    """Test InspectOptions dataclass."""
    common = CommonOptions(
        input=Path(DEFAULT_OPENAPI_INPUT),
        dry_run=True,
        debug=False,
    )
    output = OutputOptions(
        dart_output=Path(DEFAULT_DART_OUTPUT),
        docs_output=Path(DEFAULT_DOCS_OUTPUT),
        package_name=DEFAULT_DART_PACKAGE_NAME,
    )
    options = InspectOptions(
        common=common,
        output=output,
    )
    assert options.common == common
    assert options.output == output
