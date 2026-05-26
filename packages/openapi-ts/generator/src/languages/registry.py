"""Language planner registry."""

from __future__ import annotations

from languages.base import LanguagePlanner
from languages.dart.planner import DartPlanner
from languages.typescript.planner import TypeScriptPlanner


_PLANNERS: dict[str, LanguagePlanner] = {
    "dart": DartPlanner(),
    "ts": TypeScriptPlanner(),
    "typescript": TypeScriptPlanner(),
}


def get_language_planner(language: str) -> LanguagePlanner:
    """Get a language planner by language name."""
    planner = _PLANNERS.get(language.lower())
    if planner is None:
        available = ", ".join(sorted(_PLANNERS.keys()))
        raise ValueError(
            f"No planner found for language: {language}\n"
            f"Available languages: {available}"
        )
    return planner
