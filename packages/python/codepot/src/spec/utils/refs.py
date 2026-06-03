"""Spec ref parsing/building helpers."""

from __future__ import annotations

from dataclasses import dataclass

from contracts.spec.refs import SpecRef
from spec.utils.constants import REF_PREFIX, REF_SEPARATOR
from spec.utils.enums import SpecSection, SpecSubject


@dataclass(frozen=True)
class ParsedRef:
    """Parsed normalized ref."""

    raw: str
    section: str
    key: str


def build_ref(section: SpecSection, key: str, subject: SpecSubject) -> SpecRef:
    """Build a normalized portable spec ref."""

    value = f"{REF_PREFIX}{section.value}{REF_SEPARATOR}{key}"
    return SpecRef(value=value, subject=subject.value)


def parse_ref(ref: SpecRef) -> ParsedRef:
    """Parse a normalized portable spec ref."""

    value = ref.value

    if not value.startswith(REF_PREFIX):
        raise ValueError(f"Invalid spec ref. Expected prefix {REF_PREFIX!r}: {value}")

    body = value[len(REF_PREFIX) :]
    parts = body.split(REF_SEPARATOR)

    if len(parts) < 2:
        raise ValueError(f"Invalid spec ref. Expected section and key: {value}")

    section = REF_SEPARATOR.join(parts[:-1])
    key = parts[-1]

    return ParsedRef(raw=value, section=section, key=key)
