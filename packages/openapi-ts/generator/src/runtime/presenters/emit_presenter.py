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
from emission.plan import EmissionPlan
from emission.writer import WriteResult


def present_emission(plan: EmissionPlan, result: WriteResult, output_path: Path) -> None:
    key_value_table(
        TITLE_EMISSION_SUMMARY,
        [
            (COL_LANGUAGE, plan.language),
            (COL_FILES, len(plan.files)),
            (COL_CREATED, result.created),
            (COL_UPDATED, result.updated),
            (COL_UNCHANGED, result.unchanged),
            (COL_SKIPPED, result.skipped),
            (COL_OUTPUT, output_path),
        ],
    )
