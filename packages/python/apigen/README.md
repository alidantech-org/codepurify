Codepot Gen
===========

OpenAPI inference and template-driven code generation for TypeScript, Dart, and
debug output.

Installation
------------

```bash
pip install codepot-gen
```

CLI Usage
---------

```bash
codepot-gen emit \
  --input openapi.yaml \
  --language typescript \
  --output ./generated
```

Short aliases are also installed:

```bash
apigen --help
codepot --help
```

Bundled templates are included in the package. You can still override them:

```bash
codepot-gen emit \
  --input openapi.yaml \
  --language dart \
  --output ./sdk \
  --templates ./templates/dart
```

Python Usage
------------

```python
from codepot_gen import GeneratorApp

app = GeneratorApp()
```

Build And Publish
-----------------

Install build tools:

```bash
python -m pip install build twine
```

Build locally:

```bash
python -m build
```

Check the package:

```bash
python -m twine check dist/*
```

Publish to TestPyPI first:

```bash
python -m twine upload --repository testpypi dist/*
```

Publish to PyPI:

```bash
python -m twine upload dist/*
```
