from __future__ import annotations

from pathlib import Path

from core.logging import key_value_table
from emission.plan import EmissionPlan
from emission.writer import WriteResult


def present_emission(plan: EmissionPlan, result: WriteResult, output_path: Path) -> None:
    key_value_table(
        "Emission Summary",
        [
            ("Language", plan.language),
            ("Files", len(plan.files)),
            ("Created", result.created),
            ("Updated", result.updated),
            ("Unchanged", result.unchanged),
            ("Skipped", result.skipped),
            ("Output", output_path),
        ],
    )
