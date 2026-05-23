from rich.console import Console
from rich.logging import RichHandler
import logging

from constants.app import LOG_DATE_FORMAT, LOG_FORMAT_MESSAGE

console = Console()


def setup_logging(debug: bool = False) -> None:
    level = logging.DEBUG if debug else logging.INFO

    logging.basicConfig(
        level=level,
        format=LOG_FORMAT_MESSAGE,
        datefmt=LOG_DATE_FORMAT,
        handlers=[
            RichHandler(
                console=console,
                rich_tracebacks=True,
                show_path=debug,
                show_time=debug,
            )
        ],
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
