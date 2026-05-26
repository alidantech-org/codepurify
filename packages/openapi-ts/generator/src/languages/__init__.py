"""
Language-specific emitter package.

This package contains target-language emitters that consume the inference graph
and produce language-specific code. Each language subpackage (dart, typescript, debug)
implements the LanguageEmitter protocol.
"""

from languages.registry import get_language_planner

__all__ = ["get_language_planner"]
