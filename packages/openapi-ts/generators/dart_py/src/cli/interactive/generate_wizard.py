"""Interactive generation wizard."""

import typer

from constants.prompts import (
    GENERATION_TARGET_CLASSES_ONLY,
    GENERATION_TARGET_CUSTOM,
    GENERATION_TARGET_DART_ONLY,
    GENERATION_TARGET_DOCS_ONLY,
    GENERATION_TARGET_EVERYTHING,
    GENERATION_TARGET_ENUMS_ONLY,
    GENERATION_TARGET_FIELDS_ONLY,
    PROMPT_CLEAN_OUTPUT,
    PROMPT_FORMAT,
    PROMPT_GENERATION_TARGET,
    PROMPT_GENERATE_CLASSES,
    PROMPT_GENERATE_DOCS,
    PROMPT_GENERATE_DART,
    PROMPT_GENERATE_ENUMS,
    PROMPT_GENERATE_FIELDS,
    PROMPT_TOOLING,
)
from cli.options.mode import GenerationSelection


def run_wizard(clean: bool, tooling: bool, format: bool, format_non_dart: bool) -> GenerationSelection:
    """Run the interactive generation wizard."""

    choices = [
        GENERATION_TARGET_EVERYTHING,
        GENERATION_TARGET_DART_ONLY,
        GENERATION_TARGET_DOCS_ONLY,
        GENERATION_TARGET_ENUMS_ONLY,
        GENERATION_TARGET_FIELDS_ONLY,
        GENERATION_TARGET_CLASSES_ONLY,
        GENERATION_TARGET_CUSTOM,
    ]

    target = typer.prompt(
        PROMPT_GENERATION_TARGET,
        default=GENERATION_TARGET_EVERYTHING,
    )

    # Validate target
    if target not in choices:
        target = GENERATION_TARGET_EVERYTHING

    clean = typer.confirm(PROMPT_CLEAN_OUTPUT, default=clean)
    tooling = typer.confirm(PROMPT_TOOLING, default=tooling)
    format = typer.confirm(PROMPT_FORMAT, default=format)
    format_non_dart = typer.confirm("Format non-Dart files (JSON, YAML, Markdown) with Prettier?", default=format_non_dart)

    generate_docs = True
    generate_dart = True
    generate_fields = True
    generate_enums = True
    generate_classes = True

    if target == GENERATION_TARGET_EVERYTHING:
        generate_docs = True
        generate_dart = True
        generate_fields = True
        generate_enums = True
        generate_classes = True
    elif target == GENERATION_TARGET_DART_ONLY:
        generate_docs = False
        generate_dart = True
        generate_fields = True
        generate_enums = True
        generate_classes = True
    elif target == GENERATION_TARGET_DOCS_ONLY:
        generate_docs = True
        generate_dart = False
        generate_fields = False
        generate_enums = False
        generate_classes = False
    elif target == GENERATION_TARGET_ENUMS_ONLY:
        generate_docs = False
        generate_dart = True
        generate_fields = False
        generate_enums = True
        generate_classes = False
    elif target == GENERATION_TARGET_FIELDS_ONLY:
        generate_docs = False
        generate_dart = True
        generate_fields = True
        generate_enums = False
        generate_classes = False
    elif target == GENERATION_TARGET_CLASSES_ONLY:
        generate_docs = False
        generate_dart = True
        generate_fields = False
        generate_enums = False
        generate_classes = True
    elif target == GENERATION_TARGET_CUSTOM:
        generate_docs = typer.confirm(PROMPT_GENERATE_DOCS, default=True)
        generate_dart = typer.confirm(PROMPT_GENERATE_DART, default=True)

        if generate_dart:
            generate_fields = typer.confirm(PROMPT_GENERATE_FIELDS, default=True)
            generate_enums = typer.confirm(PROMPT_GENERATE_ENUMS, default=True)
            generate_classes = typer.confirm(PROMPT_GENERATE_CLASSES, default=True)

    return GenerationSelection(
        generate_docs=generate_docs,
        generate_dart=generate_dart,
        generate_fields=generate_fields,
        generate_enums=generate_enums,
        generate_classes=generate_classes,
        clean=clean,
        tooling=tooling,
        format=format,
        format_non_dart=format_non_dart,
        interactive=True,
    )
