from pathlib import Path

from constants.app import FILE_ENCODING


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_text(path: Path, content: str, *, dry_run: bool = False) -> None:
    if dry_run:
        return

    ensure_dir(path.parent)
    path.write_text(content, encoding=FILE_ENCODING)
