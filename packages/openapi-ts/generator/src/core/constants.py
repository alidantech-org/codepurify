from __future__ import annotations

# Config constants
DEFAULT_PROJECT_NAME = "generator"
PYDANTIC_ARBITRARY_TYPES_ALLOWED = "arbitrary_types_allowed"

# Path constants
DIR_SRC = "src"
DIR_TESTS = "tests"
DIR_TEMPLATES = "templates"
DIR_LANGUAGES = "languages"
FILE_PYPROJECT = "pyproject.toml"
DIR_GENERATOR = "generator"
ERROR_PROJECT_ROOT_NOT_FOUND = "Could not find generator project root. Run from generator/ or from the repo root."

# Logging theme style names
STYLE_TITLE = "title"
STYLE_SUCCESS = "success"
STYLE_WARNING = "warning"
STYLE_ERROR = "error"
STYLE_MUTED = "muted"
STYLE_PATH = "path"
STYLE_COMMAND = "command"

# Logging theme style values
STYLE_VALUE_BOLD_CYAN = "bold cyan"
STYLE_VALUE_BOLD_GREEN = "bold green"
STYLE_VALUE_BOLD_YELLOW = "bold yellow"
STYLE_VALUE_BOLD_RED = "bold red"
STYLE_VALUE_DIM = "dim"
STYLE_VALUE_MAGENTA = "magenta"
STYLE_VALUE_BOLD_BLUE = "bold blue"

# Logging Rich markup tags
TAG_TITLE_OPEN = "[title]"
TAG_TITLE_CLOSE = "[/title]"
TAG_MUTED_OPEN = "[muted]"
TAG_MUTED_CLOSE = "[/muted]"
TAG_CYAN_OPEN = "[cyan]"
TAG_CYAN_CLOSE = "[/cyan]"
TAG_SUCCESS_OPEN = "[success]"
TAG_SUCCESS_CLOSE = "[/success]"
TAG_WARNING_OPEN = "[warning]"
TAG_WARNING_CLOSE = "[/warning]"
TAG_ERROR_OPEN = "[error]"
TAG_ERROR_CLOSE = "[/error]"
TAG_PROGRESS_DESCRIPTION = "[progress.description]{task.description}"

# Logging symbols
SYMBOL_INFO = "›"
SYMBOL_SUCCESS = "✓"
SYMBOL_WARNING = "⚠"
SYMBOL_ERROR = "✗"

# Logging other constants
BORDER_STYLE_CYAN = "cyan"
PADDING = (1, 3)
DEBUG_PREFIX = "debug:"
COLUMN_KEY = "Key"
COLUMN_VALUE = "Value"
