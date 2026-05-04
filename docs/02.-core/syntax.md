---
title: Template Syntax
description: Codepurify template delimiters and expression rules
---

# Template Syntax

Codepurify uses `{! ... !}` delimiters for template expressions.

## Delimiters

```hbs
{! variable.name !}
{!#each items!}{!/each!}
{!#if condition!}{!/if!}
```

## Expressions

### Variables
```hbs
{! entity.names.casing.pascal !}
```

### Logic
```hbs
{!#if entity.fields.flags.has_string!}
  import { IsString } from "class-validator";
{!/if!}
```

### Loops
```hbs
{!#each entity.fields.arrays.all.items as field!}
  {!field.names.casing.camel!}: string;
{!/each!}
```

## Whitespace Rules

- Delimiters can be placed anywhere
- No need for special spacing
- Works inline with other content

```ts
export class {! entity.names.casing.pascal !} {
{!#each entity.fields.arrays.all.items as field!}
  {!field.names.casing.camel!}: {!#if field.flags.is_string}string{!/if!};
{!/each!}
}
```

## Language Examples

### TypeScript
```ts
interface {! entity.names.casing.pascal !}DTO {
{!#each entity.fields.arrays.all.items!}
  {!names.casing.camel!}: {!#if flags.is_string}string{!/if!};
{!/each!}
}
```

### HTML
```html
<div class="!{entity.names.casing.kebab!}">
  <h1>!{entity.title!}</h1>
</div>
```

## Conflict Avoidance

The `{! ... !}` syntax avoids conflicts with:
- JSX `{...}` expressions
- Handlebars `{{...}}` 
- Jinja2 `{{...}}`

## Incorrect vs Correct

❌ Incorrect:
```hbs
{{ entity.name }}
```

✅ Correct:
```hbs
{! entity.name !}
```

❌ Incorrect:
```hbs
{ entity.name }
```

✅ Correct:
```hbs
{! entity.name !}
```
