# Codepurify Template Syntax Guide

Codepurify templates use a deterministic templating syntax designed for:

* low syntax conflicts
* readable architecture templates
* cross-language generation
* predictable rendering
* future validation and tooling

The syntax is intentionally safe across:

* TypeScript
* React / TSX / JSX
* Vue
* Angular
* HTML
* CSS
* Python
* Rust
* Go
* SQL
* YAML
* JSON
* Markdown

---

# Core Philosophy

Templates should:

```txt id="4mjlwm"
render structure
```

The engine should:

```txt id="c4u92v"
compute architecture
```

Templates are intentionally:

* deterministic
* readable
* logic-light
* validation-friendly

---

# File Extension

Recommended extension:

```txt id="65q8op"
.cpt
```

Example:

```txt id="ny0z3h"
user.entity.types.cpt
create-user.dto.cpt
```

---

# Delimiters

Codepurify uses:

```txt id="p6j7lm"
(~ ... ~)
```

for all template expressions.

---

# Variable Interpolation

## Syntax

```txt id="3zax3w"
(~ entity.names.casing.pascal ~)
```

---

# Example

## Template

```ts id="nrd94u"
export class (~ entity.names.casing.pascal ~) {}
```

## Output

```ts id="5e6f4f"
export class User {}
```

---

# If Statements

## Syntax

```txt id="i2xkm3"
(~ if condition ~)
  ...
(~ /if ~)
```

---

# Example

```ts id="g0n37s"
(~ if entity.fields.flags.has_string ~)
import { IsString } from 'class-validator';
(~ /if ~)
```

---

# Else Statements

## Syntax

```txt id="kwjlwm"
(~ if condition ~)
  ...
(~ else ~)
  ...
(~ /if ~)
```

---

# Example

```txt id="evbgx3"
(~ if field.flags.is_nullable ~)
nullable
(~ else ~)
required
(~ /if ~)
```

---

# Each Loops

## Syntax

```txt id="a8tb50"
(~ each collection as item ~)
  ...
(~ /each ~)
```

---

# Example

```ts id="j6rdp5"
(~ each entity.fields.arrays.all.items as field ~)

  (~ field.names.casing.camel ~): string;

(~ /each ~)
```

---

# Loop Output

```ts id="z5f7d6"
email: string;
password: string;
isActive: string;
```

---

# Nested Loops

```txt id="x57kmp"
(~ each entity.relations.arrays.all.items as relation ~)

  (~ each relation.fields.arrays.all.items as field ~)

    (~ field.names.casing.camel ~)

  (~ /each ~)

(~ /each ~)
```

---

# Comments

Comments are removed during rendering.

---

# Single-Line Comments

## Syntax

```txt id="wopv8j"
(~# this is ignored #~)
```

---

# Example

```ts id="upg0kn"
(~# relation imports ~)

import * as Q from './query';
```

---

# Multi-Line Comments

## Syntax

```txt id="6t2tko"
(~*
This template generates:
- DTOs
- validators
- query types
*~)
```

---

# Raw Blocks

Raw blocks disable template processing.

Useful for generating:

* Vue templates
* Angular templates
* Handlebars templates
* Helm charts
* nested template systems

---

# Syntax

```txt id="7gdn0w"
(~ raw ~)
  ...
(~ /raw ~)
```

---

# Example

```vue id="zmp64d"
(~ raw ~)

<div>
  {{ user.name }}
</div>

(~ /raw ~)
```

---

# Output

```vue id="p3ev3x"
<div>
  {{ user.name }}
</div>
```

---

# Whitespace Rules

Whitespace is optional.

These are equivalent:

```txt id="u2bnlb"
(~ entity.name ~)
```

```txt id="b0n95z"
(~entity.name~)
```

Recommended style:

```txt id="h3lk9u"
(~ entity.name ~)
```

for readability.

---

# Context Paths

Codepurify uses deterministic dot notation.

---

# Examples

```txt id="jlwmvn"
entity.names.casing.pascal
entity.names.casing.camel
entity.names.casing.kebab

field.flags.is_nullable
field.flags.is_string

entity.fields.arrays.all.items

entity.relations.arrays.all.items
```

---

# Recommended Namespace Conventions

## Arrays

```txt id="54j9w0"
arrays.*
```

Examples:

```txt id="jpfztf"
entity.fields.arrays.all.items
entity.relations.arrays.one_to_many.items
```

---

# Flags

```txt id="wy08l5"
flags.*
```

Examples:

```txt id="jlwm7x"
field.flags.is_nullable
field.flags.is_string
entity.fields.flags.has_enum
```

---

# Counts

```txt id="r17rx3"
counts.*
```

Examples:

```txt id="jlwmt2"
entity.fields.counts.all
entity.relations.counts.one_to_many
```

---

# Casing

```txt id="mb1z6w"
casing.*
```

Examples:

```txt id="jlwmcq"
entity.names.casing.camel
entity.names.casing.pascal
entity.names.casing.snake
entity.names.casing.constant
```

---

# Validation Philosophy

Unknown paths should fail BEFORE rendering.

---

# Example Error

```txt id="yqazmv"
Unknown variable:
entity.names.casings.camel

Did you mean:
entity.names.casing.camel
```

---

# React Example

## Template

```tsx id="8y5x2p"
type Props = {
  (~ entity.names.casing.camel ~): (~ entity.names.casing.pascal ~);
};

export function (~ entity.names.casing.pascal ~)Card({
  (~ entity.names.casing.camel ~)
}: Props) {

  return (
    <div>

      <h1>
        {{ user.name }}
      </h1>

      <p>
        (~ entity.names.casing.pascal ~)
      </p>

    </div>
  );
}
```

---

# Output

```tsx id="jlwm2h"
type Props = {
  user: User;
};

export function UserCard({
  user
}: Props) {

  return (
    <div>

      <h1>
        {{ user.name }}
      </h1>

      <p>
        User
      </p>

    </div>
  );
}
```

---

# DTO Example

## Template

```ts id="jlwm5k"
export class (~ entity.names.casing.pascal ~)CreateDto {

(~ each entity.fields.arrays.all.items as field ~)

  (~ if field.flags.is_string ~)
  @IsString()
  (~ /if ~)

  (~ if field.flags.is_boolean ~)
  @IsBoolean()
  (~ /if ~)

  (~ field.names.casing.camel ~): (~ field.typescript.type ~);

(~ /each ~)

}
```

---

# Generated Output

```ts id="jlwm1s"
export class UserCreateDto {

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  isActive: boolean;

}
```

---

# Recommended Template Philosophy

GOOD:

```txt id="jlwm9o"
(~ if field.flags.is_required_string ~)
```

BAD:

```txt id="jlwm3d"
(~ if field.kind == "string" && !field.nullable ~)
```

The engine should precompute architectural meaning.

Templates should remain simple.

---

# Recommended MVP Feature Set

## Include

* variables
* if
* else
* each
* comments
* raw blocks

---

# Avoid Initially

* arbitrary JS
* mutation
* runtime functions
* math expressions
* complex pipes
* mini scripting language behavior

---

# Internal AST Recommendation

```ts id="jlwm1f"
type TemplateNode =
  | TextNode
  | VariableNode
  | IfNode
  | EachNode
  | CommentNode
  | RawNode;
```

Keep the language deterministic and small.

---

# VS Code Recommendation

MVP:

```json id="jlwm25"
{
  "files.associations": {
    "*.cpt": "typescript"
  }
}
```

Later:

* TextMate grammar
* autocomplete
* validation
* diagnostics
* template inspector

---

# Final Philosophy

```txt id="jlwm4r"
Write intent once.
Generate architecture forever.
```
