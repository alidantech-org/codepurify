"""
Dart and non-Dart file formatting utilities.

This module provides formatting functions for generated code:
- dart format for .dart files
- Optional prettier for non-Dart files (JSON, YAML, Markdown)

This module must not:
- render templates
- write files
- decide formatting configuration
"""

import shutil
import subprocess
from pathlib import Path

from logger import console


def run_dart_format(
    package_root: Path,
    paths: list[Path] | None = None,
    strict: bool = False,
) -> bool:
    """
    Run dart format on generated Dart files.

    Args:
        package_root: Root directory of the Dart package
        paths: Optional list of specific files to format. If None, formats package_root/lib
        strict: If True, fail generation if formatter fails

    Returns:
        True if formatting succeeded, False otherwise
    """
    # Check if dart command is available
    if not shutil.which("dart"):
        message = "[yellow]dart command not found. Skipping Dart formatting.[/yellow]"
        if strict:
            console.print(message)
            raise RuntimeError("dart command not found but strict formatting is enabled")
        console.print(message)
        return False

    # Determine target path
    if paths:
        # Format specific files
        targets = [str(p) for p in paths if p.suffix == ".dart"]
        if not targets:
            console.print("[dim]No Dart files to format[/dim]")
            return True
    else:
        # Format entire lib directory
        lib_dir = package_root / "lib"
        if not lib_dir.exists():
            console.print(f"[dim]lib directory not found at {lib_dir}, skipping formatting[/dim]")
            return True
        targets = [str(lib_dir)]

    console.print(f"[dim]Running dart format on {len(targets)} target(s)[/dim]")

    try:
        result = subprocess.run(
            ["dart", "format"] + targets,
            check=False,
            text=True,
            capture_output=True,
        )

        if result.returncode != 0:
            console.print(f"[red]dart format failed with exit code {result.returncode}[/red]")
            if result.stdout:
                console.print(f"[dim]stdout: {result.stdout}[/dim]")
            if result.stderr:
                console.print(f"[dim]stderr: {result.stderr}[/dim]")
            if strict:
                raise RuntimeError(f"dart format failed with exit code {result.returncode}")
            return False

        if result.stdout:
            console.print(f"[dim]dart format: {result.stdout}[/dim]")

        console.print("[green]Dart formatting complete[/green]")
        return True

    except FileNotFoundError:
        message = "[yellow]dart command not found. Skipping Dart formatting.[/yellow]"
        if strict:
            console.print(message)
            raise RuntimeError("dart command not found but strict formatting is enabled")
        console.print(message)
        return False
    except Exception as error:
        console.print(f"[red]Error running dart format: {error}[/red]")
        if strict:
            raise
        return False


def run_prettier(
    package_root: Path,
    files: list[str] | None = None,
    strict: bool = False,
) -> bool:
    """
    Run prettier on non-Dart files (JSON, YAML, Markdown).

    Args:
        package_root: Root directory of the package
        files: Optional list of specific files to format. If None, formats common package files
        strict: If True, fail generation if formatter fails

    Returns:
        True if formatting succeeded, False otherwise
    """
    # Check if npx/prettier is available
    if not shutil.which("npx"):
        message = "[yellow]npx command not found. Skipping Prettier formatting.[/yellow]"
        if strict:
            console.print(message)
            raise RuntimeError("npx command not found but strict formatting is enabled")
        console.print(message)
        return False

    # Determine target files
    if files:
        targets = files
    else:
        # Format common package files
        targets = [
            "README.md",
            "CHANGELOG.md",
            "pubspec.yaml",
            ".vscode/settings.json",
            "analysis_options.yaml",
        ]
        # Filter to only existing files
        targets = [f for f in targets if (package_root / f).exists()]

    if not targets:
        console.print("[dim]No files to format with Prettier[/dim]")
        return True

    console.print(f"[dim]Running prettier on {len(targets)} file(s)[/dim]")

    try:
        result = subprocess.run(
            ["npx", "prettier", "--write"] + targets,
            check=False,
            text=True,
            capture_output=True,
            cwd=package_root,
        )

        if result.returncode != 0:
            console.print(f"[red]prettier failed with exit code {result.returncode}[/red]")
            if result.stdout:
                console.print(f"[dim]stdout: {result.stdout}[/dim]")
            if result.stderr:
                console.print(f"[dim]stderr: {result.stderr}[/dim]")
            if strict:
                raise RuntimeError(f"prettier failed with exit code {result.returncode}")
            return False

        if result.stdout:
            console.print(f"[dim]prettier: {result.stdout}[/dim]")

        console.print("[green]Prettier formatting complete[/green]")
        return True

    except FileNotFoundError:
        message = "[yellow]npx command not found. Skipping Prettier formatting.[/yellow]"
        if strict:
            console.print(message)
            raise RuntimeError("npx command not found but strict formatting is enabled")
        console.print(message)
        return False
    except Exception as error:
        console.print(f"[red]Error running prettier: {error}[/red]")
        if strict:
            raise
        return False
