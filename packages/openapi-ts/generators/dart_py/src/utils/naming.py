import re

from constants.app import (
    REGEX_CAMEL_TO_SNAKE,
    REGEX_MULTIPLE_UNDERSCORE,
    REGEX_NON_UNDERSCORE,
    REGEX_WORD_SEPARATOR,
)


def pascal_case(value: str) -> str:
    parts = re.split(REGEX_WORD_SEPARATOR, value)
    return "".join(part[:1].upper() + part[1:] for part in parts if part)


def camel_case(value: str) -> str:
    pascal = pascal_case(value)
    if not pascal:
        return value
    return pascal[:1].lower() + pascal[1:]


def snake_case(value: str) -> str:
    value = re.sub(REGEX_CAMEL_TO_SNAKE, r"\1_\2", value)
    value = re.sub(REGEX_NON_UNDERSCORE, "_", value)
    value = re.sub(REGEX_MULTIPLE_UNDERSCORE, "_", value)
    return value.lower().strip("_")
