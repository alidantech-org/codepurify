"""Version handler."""

from constants.app import GENERATOR_NAME, GENERATOR_VERSION
from logger import console


def handle_version() -> None:
    """Print generator version."""
    console.print(f"[bold cyan]{GENERATOR_NAME}[/bold cyan] [green]v{GENERATOR_VERSION}[/green]")
