from __future__ import annotations

from pathlib import Path

from constants.files import (
    COL_CREATED,
    COL_FILES,
    COL_LANGUAGE,
    COL_OUTPUT,
    COL_SKIPPED,
    COL_UNCHANGED,
    COL_UPDATED,
    TITLE_EMISSION_SUMMARY,
)
from core.logging import key_value_table

# TODO: Replace with new emission.templates.planning module
# from emission.plan import EmissionPlan
# from emission.writer import WriteResult


def present_emission(plan: object, result: object, output_path: Path) -> None:
    # TODO: Replace with new emission plan structure
    key_value_table(
        TITLE_EMISSION_SUMMARY,
        [
            (COL_LANGUAGE, getattr(plan, "language", "unknown")),
            (COL_FILES, len(getattr(plan, "files", []))),
            (COL_CREATED, getattr(result, "created", 0)),
            (COL_UPDATED, getattr(result, "updated", 0)),
            (COL_UNCHANGED, getattr(result, "unchanged", 0)),
            (COL_SKIPPED, getattr(result, "skipped", 0)),
            (COL_OUTPUT, output_path),
        ],
    )
