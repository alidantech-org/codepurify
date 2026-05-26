"""Render planning primitives for the shared emission engine.

Render planning connects scanned template descriptors with prepared language
contexts and produces output file plans without writing files.
"""

from emission.planning.render_context import RenderContexts
from emission.planning.render_plan import PlannedRender, build_render_plan

__all__ = ["RenderContexts", "PlannedRender", "build_render_plan"]
