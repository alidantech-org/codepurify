"""Dart formatter service."""

from pathlib import Path

from constants.dart_cli import DART_FORMAT_COMMAND
from constants.messages import MSG_DART_COMMAND_NOT_FOUND, MSG_DART_FORMAT_COMPLETED, MSG_DART_FORMAT_FAILED
from logger import console, get_logger

log = get_logger(__name__)


def run_dart_format(dart_output: Path, strict: bool = False) -> None:
    """Run dart format on the generated Dart files."""
    import subprocess

    # dart_output is now the package root (e.g., packages/dart/)
    dart_package_dir = dart_output

    log.info(f"Running dart format on {dart_output}")

    try:
        result = subprocess.run(
            DART_FORMAT_COMMAND,
            cwd=dart_package_dir,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            console.print(MSG_DART_FORMAT_FAILED.format(error=result.stderr))
            if strict:
                raise RuntimeError("dart format failed in strict mode")
        else:
            console.print(MSG_DART_FORMAT_COMPLETED)
    except FileNotFoundError:
        console.print(MSG_DART_COMMAND_NOT_FOUND)
        if strict:
            raise RuntimeError("dart command not found in strict mode")
