import json
from pathlib import Path
from typing import Any

from constants.app import SUPPORTED_OPENAPI_EXTENSIONS
import yaml


OpenApiSpec = dict[str, Any]


def load_openapi(path: Path) -> OpenApiSpec:
    if path.suffix.lower() not in SUPPORTED_OPENAPI_EXTENSIONS:
        raise ValueError(
            f"Unsupported OpenAPI file extension: {path.suffix}. " f"Supported: {', '.join(sorted(SUPPORTED_OPENAPI_EXTENSIONS))}"
        )

    if not path.exists():
        raise FileNotFoundError(f"OpenAPI file not found: {path}")

    text = path.read_text(encoding="utf-8")

    if path.suffix.lower() == ".json":
        return json.loads(text)

    loaded = yaml.safe_load(text)

    if not isinstance(loaded, dict):
        raise ValueError("OpenAPI file did not parse into an object")

    return loaded
