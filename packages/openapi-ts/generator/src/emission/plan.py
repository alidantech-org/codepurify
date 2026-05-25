from __future__ import annotations

from dataclasses import dataclass

from emission.files import EmittedFile


@dataclass(frozen=True)
class EmissionPlan:
    language: str
    files: tuple[EmittedFile, ...]
