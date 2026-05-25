from __future__ import annotations

from constants.files import ENCODING_UTF8
from dataclasses import dataclass
from pathlib import Path

from emission.plan import EmissionPlan


@dataclass(frozen=True)
class WriteResult:
    created: int = 0
    updated: int = 0
    unchanged: int = 0
    skipped: int = 0


class FileWriter:
    def write_plan(
        self,
        plan: EmissionPlan,
        output_root: Path,
        dry_run: bool = False,
    ) -> WriteResult:
        created = 0
        updated = 0
        unchanged = 0
        skipped = 0

        for file in plan.files:
            target = output_root / file.path
            normalized_content = _normalize_content(file.content)

            if dry_run:
                skipped += 1
                continue

            target.parent.mkdir(parents=True, exist_ok=True)

            if target.exists():
                existing = target.read_text(encoding=ENCODING_UTF8)
                if existing == normalized_content:
                    unchanged += 1
                    continue

                target.write_text(normalized_content, encoding=ENCODING_UTF8)
                updated += 1
                continue

            target.write_text(normalized_content, encoding=ENCODING_UTF8)
            created += 1

        return WriteResult(
            created=created,
            updated=updated,
            unchanged=unchanged,
            skipped=skipped,
        )


def _normalize_content(value: str) -> str:
    normalized = value.replace("\r\n", "\n").replace("\r", "\n")
    return normalized.rstrip() + "\n"
