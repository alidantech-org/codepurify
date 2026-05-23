from pathlib import Path
from pydantic import BaseModel, Field

from constants.app import (
    DEFAULT_DART_OUTPUT_DIR,
    DEFAULT_DOCS_OUTPUT_DIR,
    PACKAGE_NAME,
)


class GeneratorConfig(BaseModel):
    input: Path
    dart_output: Path = Field(default=DEFAULT_DART_OUTPUT_DIR)
    docs_output: Path = Field(default=DEFAULT_DOCS_OUTPUT_DIR)
    package_name: str = PACKAGE_NAME

    generate_docs: bool = True
    generate_dart: bool = True
    generate_enums_only: bool = False
    generate_fields_only: bool = False
    generate_classes_only: bool = False

    format: bool = False
    strict_format: bool = False
    format_non_dart: bool = False
    tooling: bool = False
    force_tooling: bool = False

    clean: bool = False
    dry_run: bool = False
    debug: bool = False
    interactive: bool = False

    @property
    def lib_output(self) -> Path:
        """Derive lib root from package root."""
        return self.dart_output / "lib"
