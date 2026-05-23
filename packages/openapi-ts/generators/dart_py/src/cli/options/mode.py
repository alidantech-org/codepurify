"""Generation mode resolver."""

from dataclasses import dataclass


@dataclass(frozen=True)
class GenerationSelection:
    """What to generate based on CLI flags."""

    generate_docs: bool
    generate_dart: bool
    generate_fields: bool
    generate_enums: bool
    generate_classes: bool
    clean: bool
    tooling: bool
    format: bool
    format_non_dart: bool
    interactive: bool


def resolve_generation_mode(
    yes: bool,
    interactive: bool,
    no_docs: bool,
    no_dart: bool,
    only_docs: bool,
    only_dart: bool,
    only_enums: bool,
    only_fields: bool,
    only_classes: bool,
    clean: bool,
    format: bool,
    format_non_dart: bool,
    tooling: bool,
) -> GenerationSelection:
    """Resolve what should be generated based on CLI flags."""

    # If -y/--yes is provided, generate everything non-interactively
    if yes:
        return GenerationSelection(
            generate_docs=True,
            generate_dart=True,
            generate_fields=True,
            generate_enums=True,
            generate_classes=True,
            clean=clean,
            tooling=tooling,
            format=format,
            format_non_dart=format_non_dart,
            interactive=False,
        )

    # If --interactive is explicitly provided, use interactive mode
    if interactive:
        return GenerationSelection(
            generate_docs=True,
            generate_dart=True,
            generate_fields=True,
            generate_enums=True,
            generate_classes=True,
            clean=clean,
            tooling=tooling,
            format=format,
            format_non_dart=format_non_dart,
            interactive=True,
        )

    # If any explicit mode flags are provided, skip interactive
    has_explicit_mode = no_docs or no_dart or only_docs or only_dart or only_enums or only_fields or only_classes

    if has_explicit_mode:
        generate_docs_enabled = not no_docs
        generate_dart_enabled = not no_dart
        generate_enums_only = only_enums
        generate_fields_only = only_fields
        generate_classes_only = only_classes

        if only_docs:
            generate_docs_enabled = True
            generate_dart_enabled = False

        if only_dart:
            generate_docs_enabled = False
            generate_dart_enabled = True

        if only_enums:
            generate_docs_enabled = False
            generate_dart_enabled = True
            generate_enums_only = True

        if only_classes:
            generate_docs_enabled = False
            generate_dart_enabled = True
            generate_classes_only = True

        if only_fields:
            generate_docs_enabled = False
            generate_dart_enabled = True
            generate_fields_only = True

        return GenerationSelection(
            generate_docs=generate_docs_enabled,
            generate_dart=generate_dart_enabled,
            generate_fields=generate_fields_only or (generate_dart_enabled and not generate_enums_only and not generate_classes_only),
            generate_enums=generate_enums_only or (generate_dart_enabled and not generate_fields_only and not generate_classes_only),
            generate_classes=generate_classes_only or (generate_dart_enabled and not generate_fields_only and not generate_enums_only),
            clean=clean,
            tooling=tooling,
            format=format,
            format_non_dart=format_non_dart,
            interactive=False,
        )

    # No explicit flags and no -y: default to interactive
    return GenerationSelection(
        generate_docs=True,
        generate_dart=True,
        generate_fields=True,
        generate_enums=True,
        generate_classes=True,
        clean=clean,
        tooling=tooling,
        format=format,
        format_non_dart=format_non_dart,
        interactive=True,
    )
