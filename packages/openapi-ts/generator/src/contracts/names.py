"""Deterministic naming contract for template variables.

The naming implementation lives in utils.naming. This module only exposes the
stable contract type used by API and template contracts.
"""

from __future__ import annotations

from typing import Any

from utils.naming import build_name

ContractName = Any


def make_contract_name(value: str) -> ContractName:
    """Build a contract name using the shared naming provider."""
    return build_name(value)
