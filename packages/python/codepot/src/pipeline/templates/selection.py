"""Template selection parsing and validation."""

from __future__ import annotations

from contracts.templates.config.selection import (
    TemplateSelect,
    TemplateSelectMode,
    TemplateSelectSubject,
)


def parse_template_select(value: str) -> TemplateSelect:
    """Parse a template select expression."""

    if value == TemplateSelectMode.ONCE.value:
        return TemplateSelect(
            raw=value,
            subject=None,
            mode=TemplateSelectMode.ONCE,
        )

    parts = value.split(".")

    if len(parts) != 2:
        raise ValueError(f"Invalid template select expression: {value}")

    subject_value, mode_value = parts

    return TemplateSelect(
        raw=value,
        subject=TemplateSelectSubject(subject_value),
        mode=TemplateSelectMode(mode_value),
    )


def validate_template_select(value: str) -> TemplateSelect:
    """Validate and return parsed template select expression."""

    selected = parse_template_select(value)

    if selected.mode == TemplateSelectMode.ONCE and selected.subject is not None:
        raise ValueError("Select mode 'once' must not have a subject.")

    if selected.mode != TemplateSelectMode.ONCE and selected.subject is None:
        raise ValueError(f"Select expression requires a subject: {value}")

    return selected
