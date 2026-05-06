---
title: Variables & Context
description: Understanding variable paths and resolution
---

# Variables & Context

Variables use dot notation to access nested context data.

## Variable Paths

```hbs
{! entity.names.casing.camel !}
{! field.flags.is_string !}
{! global.templates.current.name !}
```

## Root Objects

### entity
Contains entity-level data like names, fields, relations.

```hbs
{! entity.names.original !}
{! entity.fields.counts.all !}
{! entity.relations.arrays.one_to_many !}
```

### field
Available inside field loops, contains field-specific data.

```hbs
{! field.names.casing.camel !}
{! field.flags.is_nullable !}
{! field.index !}
```

### relation
Available inside relation loops, contains relation metadata.

```hbs
{! relation.names.casing.pascal !}
{! relation.kind !}
{! relation.target !}
```

### global
Contains system-wide data like templates and utilities.

```hbs
{! global.templates.current.name !}
{! global.templates.all.by_name.base_dto !}
```

## Simple Variables

```hbs
{! entity.title !}
{! entity.description !}
```

## Nested Variables

```hbs
{! entity.fields.arrays.by_kind.string.items !}
{! global.templates.all.arrays.items !}
```

## Variable Resolution

1. Check current scope (field, relation, etc.)
2. Check parent scopes
3. Check global scope
4. Return undefined if not found

## Examples

### Entity Name
```hbs
// Input: entity.names.original = "userProfile"
{! entity.names.casing.pascal !}
// Output: "UserProfile"
```

### Field Type
```hbs
// Inside field loop
{! field.flags.is_string !}
// Output: true/false
```

### Template Metadata
```hbs
{! global.templates.current.name !}
// Output: "user-dto"
```
