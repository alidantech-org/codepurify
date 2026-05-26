"""Interactive CLI prompts.

Questionary is imported lazily so non-interactive commands work even when
interactive dependencies are not installed.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable, TypeVar, cast

T = TypeVar("T")

_LANGUAGES = ["debug", "dart", "typescript"]

_MISSING = object()


def ask_input_path() -> Path:
    """Ask for the input OpenAPI file path."""
    value = _ask(
        lambda q: q.path(
            "OpenAPI input file:",
            validate=lambda p: Path(p).exists() or "File does not exist",
        )
    )
    return Path(value)


def ask_language() -> str:
    """Ask for the target language."""
    return _ask(
        lambda q: q.select(
            "Target language:",
            choices=_LANGUAGES,
            use_shortcuts=True,
        )
    )


def ask_output_path() -> Path:
    """Ask for the output directory or file path."""
    value = _ask(lambda q: q.path("Output path:"))
    return Path(value)


def ask_confirm(message: str, *, default: bool = False) -> bool:
    """Ask a yes/no confirmation question."""
    return _ask(lambda q: q.confirm(message, default=default))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _ask(prompt_factory: Callable[[Any], Any]) -> T:
    """Run a questionary prompt and raise on empty/cancelled input."""
    q = _load_questionary()
    value = prompt_factory(q).ask()

    if value is None:
        raise KeyboardInterrupt("prompt cancelled")

    if isinstance(value, str) and not value.strip():
        raise ValueError("a value is required")

    return cast(T, value)


def _load_questionary():
    try:
        import questionary

        return questionary
    except ImportError as exc:
        raise RuntimeError("Interactive mode requires 'questionary'. " "Install it with:  pip install questionary") from exc
