"""Inference-to-contract mapping.

This package converts internal inference graph models into stable API contracts
consumed by language adapters.
"""

from inference.contract.builder import build_api_contract

__all__ = ["build_api_contract"]
