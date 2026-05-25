from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml

from core.errors import OpenApiLoadError
from openapi.document import OpenApiDocument


def load_openapi_document(path: Path) -> OpenApiDocument:
    if not path.exists():
        raise OpenApiLoadError(f"OpenAPI file does not exist: {path}")

    if not path.is_file():
        raise OpenApiLoadError(f"OpenAPI path is not a file: {path}")

    suffix = path.suffix.lower()

    try:
        if suffix in {".yaml", ".yml"}:
            raw = _load_yaml(path)
        elif suffix == ".json":
            raw = _load_json(path)
        else:
            raise OpenApiLoadError(f"Unsupported OpenAPI file extension '{suffix}'. Use .yaml, .yml, or .json.")
    except OpenApiLoadError:
        raise
    except Exception as exc:
        raise OpenApiLoadError(f"Failed to load OpenAPI document: {path}") from exc

    if not isinstance(raw, dict):
        raise OpenApiLoadError("OpenAPI document root must be an object.")

    if "openapi" not in raw:
        raise OpenApiLoadError("OpenAPI document is missing required 'openapi' field.")

    if "paths" not in raw:
        raise OpenApiLoadError("OpenAPI document is missing required 'paths' field.")

    return OpenApiDocument(path=path, raw=raw)


def _load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as file:
        value = yaml.safe_load(file)

    return value or {}


def _load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as file:
        value = json.load(file)

    return value or {}
