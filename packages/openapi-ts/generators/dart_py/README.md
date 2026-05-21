# Dart Generator

Custom Dart SDK generator for OpenAPI specs.

## Installation

```bash
python -m pip install -e ".[dev]"
```

## Usage

```bash
dart-py version
dart-py inspect --input sdk/openapi/openapi.yaml --output sdk/packages/dart/lib
dart-py generate --input sdk/openapi/openapi.yaml --output sdk/packages/dart/lib
```
