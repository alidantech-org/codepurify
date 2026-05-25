from __future__ import annotations

from languages.debug.emitter import DebugEmitter


def create_emitter() -> DebugEmitter:
    return DebugEmitter()
