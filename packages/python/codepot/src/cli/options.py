"""Shared Typer option helpers."""

from __future__ import annotations

import typer

from cli.constants import options as opt


def spec_argument():
    return typer.Argument(help=opt.HELP_SPEC)


def language_option():
    return typer.Option("--language", "-l", help=opt.HELP_LANGUAGE)


def templates_option():
    return typer.Option("--templates", "-t", help=opt.HELP_TEMPLATES)


def output_option():
    return typer.Option("--out", "-o", help=opt.HELP_OUT)


def only_option():
    return typer.Option("--only", help=opt.HELP_ONLY)


def json_option():
    return typer.Option("--json", help=opt.HELP_JSON)


def quiet_option():
    return typer.Option("--quiet", "-q", help=opt.HELP_QUIET)


def verbose_option():
    return typer.Option("--verbose", "-v", help=opt.HELP_VERBOSE)


def debug_option():
    return typer.Option("--debug", help=opt.HELP_DEBUG)


def interactive_option():
    return typer.Option("--interactive", "-I", help=opt.HELP_INTERACTIVE)


def parse_only(value: str | None) -> tuple[str, ...]:
    if value is None:
        return ()
    return tuple(part.strip() for part in value.split(",") if part.strip())
