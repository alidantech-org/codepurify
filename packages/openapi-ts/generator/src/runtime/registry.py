from __future__ import annotations

from core.errors import CommandError
from languages.base import LanguageEmitter


def create_language_emitter(language: str) -> LanguageEmitter:
    normalized = language.strip().lower()

    if normalized == "debug":
        from languages.debug.language import create_emitter

        return create_emitter()

    raise CommandError(f"Unsupported language: {language}")
