"""CLI command and option constants."""

# App name and description
APP_NAME = "generator"
APP_DESCRIPTION = "General OpenAPI inference and multi-language code generation engine."
APP_VERSION = "version 0.1.0"

# Command names
CMD_INSPECT = "inspect"
CMD_INFER = "infer"
CMD_EMIT = "emit"
CMD_VALIDATE = "validate"
CMD_EMIT_PLAN = "emit-plan"

# Command help texts
HELP_INSPECT = "Inspect an OpenAPI document and print a summary."
HELP_INFER = "Run language-neutral OpenAPI inference."
HELP_EMIT = "Emit generated code for a target language."
HELP_VALIDATE = "Validate an OpenAPI document for generator compatibility."
HELP_EMIT_PLAN = "Visualize planned output from templates."

# Option names
OPT_INPUT = "input"
OPT_OUTPUT = "output"
OPT_LANGUAGE = "language"
OPT_TEMPLATES = "templates"
OPT_DEBUG = "debug"
OPT_VERBOSE = "verbose"
OPT_QUIET = "quiet"
OPT_DRY_RUN = "dry-run"
OPT_VERSION = "version"

# Option help texts
HELP_INPUT = "Path to the OpenAPI YAML or JSON file."
HELP_OUTPUT = "Output directory for generated files."
HELP_OUTPUT_INFERENCE = "Optional output path for inference JSON."
HELP_LANGUAGE = "Target language plugin, for example: debug, dart, typescript."
HELP_TEMPLATES = "Template root or language template folder."
HELP_DEBUG = "Show debug logs."
HELP_VERBOSE = "Show verbose logs."
HELP_QUIET = "Reduce terminal output."
HELP_DRY_RUN = "Plan emission without writing files."
HELP_VERSION = "Show generator version."

# Header texts
HEADER_VALIDATE = "Validate OpenAPI"
HEADER_INSPECT = "Inspect OpenAPI"
HEADER_INFER = "Infer OpenAPI"
HEADER_EMIT = "Emit Code"
HEADER_EMIT_PLAN = "Emit Plan"

# Language names
LANG_DEBUG = "debug"
LANG_DART = "dart"
LANG_TYPESCRIPT = "typescript"
