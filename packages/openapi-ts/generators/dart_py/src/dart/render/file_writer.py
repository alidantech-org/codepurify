"""
Generated file writer with change detection and categorization.

This module provides centralized file writing functionality that:
- Only writes if content has changed
- Creates parent directories as needed
- Normalizes line endings to \n
- Ensures final newline
- Logs created/updated/unchanged status
- Categorizes written files by extension

This module must not:
- perform formatting
- render templates
- decide file content
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

from logger import console


@dataclass(frozen=True)
class WriteResult:
    """Result of a file write operation."""
    path: Path
    status: Literal["created", "updated", "unchanged", "dry_run"]
    changed: bool


@dataclass
class GeneratedFiles:
    """Categorized collection of generated file paths."""
    dart: list[Path] = field(default_factory=list)
    yaml: list[Path] = field(default_factory=list)
    json: list[Path] = field(default_factory=list)
    markdown: list[Path] = field(default_factory=list)
    other: list[Path] = field(default_factory=list)

    def add(self, path: Path) -> None:
        """Categorize a file path by extension."""
        suffix = path.suffix.lower()
        if suffix == ".dart":
            self.dart.append(path)
        elif suffix in {".yaml", ".yml"}:
            self.yaml.append(path)
        elif suffix == ".json":
            self.json.append(path)
        elif suffix in {".md", ".markdown"}:
            self.markdown.append(path)
        else:
            self.other.append(path)

    def all_files(self) -> list[Path]:
        """Return all file paths in a single list."""
        return self.dart + self.yaml + self.json + self.markdown + self.other


def write_text_if_changed(
    path: Path,
    content: str,
    dry_run: bool = False,
    generated_files: GeneratedFiles | None = None,
) -> WriteResult:
    """
    Write text content to a file only if it has changed.

    Args:
        path: Target file path
        content: Content to write
        dry_run: If True, don't actually write files
        generated_files: Optional GeneratedFiles to track written paths

    Returns:
        WriteResult with status and changed flag
    """
    # Normalize line endings to \n
    normalized_content = content.replace("\r\n", "\n").replace("\r", "\n")

    # Ensure final newline
    if normalized_content and not normalized_content.endswith("\n"):
        normalized_content += "\n"

    # Check if file exists and compare content
    if path.exists():
        existing_content = path.read_text(encoding="utf-8")
        existing_normalized = existing_content.replace("\r\n", "\n").replace("\r", "\n")

        if existing_normalized == normalized_content:
            if generated_files:
                generated_files.add(path)
            return WriteResult(path=path, status="unchanged", changed=False)

    # Create parent directories
    path.parent.mkdir(parents=True, exist_ok=True)

    if dry_run:
        if generated_files:
            generated_files.add(path)
        return WriteResult(path=path, status="dry_run", changed=True)

    # Write the file
    path.write_text(normalized_content, encoding="utf-8")

    # Determine status
    status = "created" if not path.exists() else "updated"
    if generated_files:
        generated_files.add(path)

    return WriteResult(path=path, status=status, changed=True)


def print_write_summary(results: list[WriteResult]) -> None:
    """Print a summary of write operations."""
    created = sum(1 for r in results if r.status == "created")
    updated = sum(1 for r in results if r.status == "updated")
    unchanged = sum(1 for r in results if r.status == "unchanged")
    dry_run = sum(1 for r in results if r.status == "dry_run")

    if created:
        console.print(f"[green]Created {created} file(s)[/green]")
    if updated:
        console.print(f"[yellow]Updated {updated} file(s)[/yellow]")
    if unchanged:
        console.print(f"[dim]Unchanged {unchanged} file(s)[/dim]")
    if dry_run:
        console.print(f"[cyan]Dry run: {dry_run} file(s) would be written[/cyan]")
