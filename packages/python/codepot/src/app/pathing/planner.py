"""Path planning from selection groups and records."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from codepot.pathing.variables import build_path_variables
from codepot.selection.config import SelectionGroup


@dataclass(frozen=True)
class PathPlannedItem:
    """One selected record with prepared path variables."""

    group: SelectionGroup
    record: object | None
    variables: Any


def plan_group_items(group: SelectionGroup, records: tuple[object, ...]) -> tuple[PathPlannedItem, ...]:
    """Create path planned items for a group."""

    if group.select == "once":
        return (PathPlannedItem(group=group, record=None, variables=None),)

    return tuple(
        PathPlannedItem(
            group=group,
            record=record,
            variables=build_path_variables(record.key),
        )
        for record in records
    )
