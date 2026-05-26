"""Render plan builder for scanned templates."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from emission.model import TemplateContext
from emission.planning.render_context import Context, RenderContexts
from emission.templates.descriptor import TemplateDescriptor
from emission.templates.path_expander import expand_template_path


@dataclass(frozen=True)
class PlannedRender:
    """One planned template render."""

    template_path: Path
    output_path: Path
    owner: str
    context: Mapping[str, Any]


def build_render_plan(
    descriptors: Sequence[TemplateDescriptor],
    contexts: RenderContexts,
) -> list[PlannedRender]:
    """Pair template descriptors with matching contexts."""
    planned: list[PlannedRender] = []

    for descriptor in descriptors:
        for raw_context in contexts.for_owner(descriptor.owner):
            context = _as_mapping(raw_context)
            output_path = expand_template_path(descriptor.relative_path, context)

            planned.append(
                PlannedRender(
                    template_path=descriptor.relative_path,
                    output_path=output_path,
                    owner=descriptor.owner.value,
                    context=context,
                )
            )

    return sorted(planned, key=lambda item: item.output_path.as_posix())


def _as_mapping(context: Context) -> Mapping[str, Any]:
    if isinstance(context, TemplateContext):
        return context.to_dict()

    return context
