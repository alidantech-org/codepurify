import pytest
from pathlib import Path
from openapi.loader import load_openapi


def test_load_nonexistent():
    with pytest.raises(FileNotFoundError):
        load_openapi(Path("nonexistent.yaml"))


def test_load_unsupported_extension():
    with pytest.raises(ValueError):
        load_openapi(Path("test.txt"))
