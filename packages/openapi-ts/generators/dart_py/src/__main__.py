import sys

from constants.app import (
    CLI_COMMAND_DOCS,
    CLI_COMMAND_GENERATE,
    CLI_COMMAND_INSPECT,
    CLI_COMMAND_VERSION,
)
from cli.app import app

KNOWN_COMMANDS = {
    CLI_COMMAND_GENERATE,
    CLI_COMMAND_DOCS,
    CLI_COMMAND_INSPECT,
    CLI_COMMAND_VERSION,
}

if len(sys.argv) == 1:
    sys.argv.append(CLI_COMMAND_GENERATE)
elif sys.argv[1].startswith("-"):
    sys.argv.insert(1, CLI_COMMAND_GENERATE)
elif sys.argv[1] not in KNOWN_COMMANDS:
    sys.argv.insert(1, CLI_COMMAND_GENERATE)

app()
