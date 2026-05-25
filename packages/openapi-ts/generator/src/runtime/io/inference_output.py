from __future__ import annotations

import json

from pathlib import Path

from core.logging import success
from inference.models import InferenceGraph
from inference.serialization import inference_graph_to_dict


def write_inference_graph(graph: InferenceGraph, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(inference_graph_to_dict(graph), indent=2, default=str),
        encoding="utf-8",
    )

    success(f"Wrote inference graph: {output_path}")
