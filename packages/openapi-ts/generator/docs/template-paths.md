# Template Path System Guide

This generator uses **selector-driven template paths**. Template paths are no longer tied to folder names like `models`, `dtos`, or `resources`. Instead, selection is controlled by `paths.yaml`.

## Core rules

```txt
(selector) = select/loop items, not emitted
[value]    = dynamic emitted folder/file value
[[value]]  = escaped literal [value]
((value))  = escaped literal (value)
```

Example:

```txt
(resources)/res/[path]/[name.path]/resource.txt.j2
```

If `resources` selects each resource, and a resource exposes:

```txt
path = ("platform", "auth")
name.path = "users"
```

The emitted file becomes:

```txt
.output/res/platform/auth/users/resource.txt
```

## Important principle

Selection only controls **how many files are emitted** and which local variables are exposed for path naming.

It does **not** limit template access.

Every template still has access to global variables like:

```txt
project
api
lang
emit
meta
resources
schemas
operations
file
```

## `paths.yaml`

Each template root can contain a `paths.yaml` file.

Example:

```yaml
template_extension: ".j2"
strip_template_extension: true
allow_raw_files: true

variables:
  resources:
    select: resources
    as: resource
    expose:
      name: resource.name
      path: resource.path
      path_name: resource.path_name
      operations_count: resource.meta.operations_count

  models:
    select: schemas.emit_models
    as: model
    expose:
      name: model.name
      kind: model.api.kind
      resource: model.api.resource
      dependencies: model.emit.dependencies

  dtos:
    select: schemas.emit_dtos
    as: dto
    expose:
      name: dto.name
      kind: dto.api.kind
      resource: dto.api.resource
      dependencies: dto.emit.dependencies

  enums:
    select: schemas.emit_enums
    as: enum
    expose:
      name: enum.name
      kind: enum.api.kind

  primitives:
    select: schemas.primitives
    as: primitive
    expose:
      name: primitive.name
      kind: primitive.api.kind

  operations:
    select: operations
    as: operation
    expose:
      name: operation.name
      method: operation.api.method
      resource: operation.api.resource
```

## How selection works

This path:

```txt
(models)/models/[name.path]_model.txt.j2
```

means:

```txt
select schemas.emit_models
loop each model
bind current model as model
expose name = model.name
emit one file per model
```

Example output:

```txt
.output/models/user_model_model.txt
.output/models/base_public_model_model.txt
```

## Dynamic folder names

Dynamic values can be used as folders:

```txt
(models)/models/[resource]/[name.path]/model.txt.j2
```

Output:

```txt
.output/models/users/user_model/model.txt
.output/models/shared/base_model/model.txt
```

## Dynamic file names

Dynamic values can also be used in file names:

```txt
(operations)/operations/[method]_[name.path]_operation.txt.j2
```

Output:

```txt
.output/operations/get_list_users_operation.txt
.output/operations/post_create_user_operation.txt
```

## Sequence path values

If a dynamic value resolves to a tuple/list, it expands into nested folders.

Template path:

```txt
(resources)/res/[path]/[name.path]/resource.txt.j2
```

Value:

```txt
path = ("platform", "auth")
```

Output:

```txt
.output/res/platform/auth/users/resource.txt
```

Do **not** use old spread syntax:

```txt
[...path] ❌
[path]    ✅
```

## Escaping framework paths

For frameworks like Next.js, literal brackets are common.

Template path:

```txt
app/[[...slug]]/page.tsx.j2
```

Output:

```txt
app/[...slug]/page.tsx
```

Literal parentheses:

```txt
docs/((not-a-selector)).txt.j2
```

Output:

```txt
docs/(not-a-selector).txt
```

## Barrel templates

A barrel template usually emits once and loops inside the template.

Path:

```txt
barrels/models_barrel.txt.j2
```

Template content:

```jinja
{% for model in schemas.emit_models %}
- {{ model.name.pascal }}
{% endfor %}
```

Output:

```txt
.output/barrels/models_barrel.txt
```

You can also create selected barrels, for example one per resource:

```txt
(resources)/barrels/[name.path]_barrel.txt.j2
```

Output:

```txt
.output/barrels/users_barrel.txt
.output/barrels/shared_barrel.txt
```

## Good examples

```txt
(resources)/res/[path]/[name.path]/resource.txt.j2
(models)/models/[resource]/[name.path]/model.txt.j2
(models)/models/files/[name.path]_model.txt.j2
(dtos)/dtos/[name.path]/dto.txt.j2
(enums)/enums/[name.path]_enum.txt.j2
(operations)/operations/[method]_[name.path]_operation.txt.j2
barrels/models_barrel.txt.j2
app/[[...slug]]/page.tsx.j2
```

## Bad examples

```txt
models/[model.name.path]/model.txt.j2
```

Bad because `[model.name.path]` only names a path. It no longer selects models.

Use:

```txt
(models)/models/[name.path]/model.txt.j2
```

Also bad:

```txt
(resources)/res/[...path]/[name.path]/resource.txt.j2
```

Use:

```txt
(resources)/res/[path]/[name.path]/resource.txt.j2
```

## Debug checklist

Run:

```bash
python -m compileall src tests
pytest tests/inference tests/languages tests/emission -q
python -m cli.main emit -i openapi.yaml -l debug -o .output --dry-run -v
python -m cli.main emit -i openapi.yaml -l debug -o .output -v
```

Inspect generated files:

```bash
python - <<'PY'
from pathlib import Path
for path in sorted(Path(".output").rglob("*")):
    if path.is_file():
        print(path.as_posix())
PY
```

Expected resource path example:

```txt
.output/res/platform/auth/users/resource.txt
```
