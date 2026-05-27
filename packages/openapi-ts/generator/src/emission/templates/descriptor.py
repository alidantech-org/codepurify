"""Template descriptor models.

Descriptors describe discovered template files and their path selectors.
Folder names are never semantic. Selection comes only from `(variable)`
segments configured through paths.yaml.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from contracts.paths import PathToken, PathTokenKind
from emission.templates.path_tokens import PathSegment, parse_path_segments


@dataclass(frozen=True)
class TemplateDescriptor:
    """A discovered template file."""

    template_root: Path
    relative_path: Path
    selectors: tuple[PathToken, ...] = ()
    output_parts: tuple[str, ...] = ()
    segments: tuple[PathSegment, ...] = ()
    is_template: bool = False


def describe_template(template_root: Path, relative_path: Path) -> TemplateDescriptor:
    """Build a descriptor from a relative template path."""
    segments = parse_path_segments(tuple(relative_path.parts))
    selectors = _selector_tokens(segments)
    output_parts = _output_parts(segments)

    return TemplateDescriptor(
        template_root=template_root,
        relative_path=relative_path,
        selectors=selectors,
        output_parts=output_parts,
        segments=segments,
        is_template=relative_path.as_posix().endswith(".j2"),
    )


def _selector_tokens(segments: tuple[PathSegment, ...]) -> tuple[PathToken, ...]:
    """Return selector tokens from parsed path segments."""
    selectors: list[PathToken] = []

    for segment in segments:
        if not segment.is_selector:
            continue

        if not segment.tokens:
            continue

        token = segment.tokens[0]
        if token.kind == PathTokenKind.SELECTOR:
            selectors.append(token)

    return tuple(selectors)


def _output_parts(segments: tuple[PathSegment, ...]) -> tuple[str, ...]:
    """Return path parts that should be emitted.

    Selector segments are logic-only and are removed from the output path.
    """
    return tuple(segment.raw for segment in segments if not segment.is_selector)
