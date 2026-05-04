---
title: First Template
description: Create your first Codepurify template
---

# First Template

Create a simple template to generate TypeScript interfaces.

## Template File

Create `templates/user.dto.hbs`:

```hbs
export interface {! entity.names.casing.pascal !} {
{!#each entity.fields.arrays.all.items!}
  {!names.casing.camel!}: {!#if flags.is_string}string{!/if!}{!#if flags.is_number}number{!/if!};
{!/each!}
}
```

## Input Context

Create `types/user.json`:

```json
{
  "entity": {
    "names": {
      "original": "user",
      "casing": {
        "camel": "user",
        "pascal": "User"
      }
    },
    "fields": {
      "arrays": {
        "all": {
          "items": [
            {
              "names": {
                "original": "email",
                "casing": {
                  "camel": "email"
                }
              },
              "flags": {
                "is_string": true,
                "is_number": false
              }
            },
            {
              "names": {
                "original": "age",
                "casing": {
                  "camel": "age"
                }
              },
              "flags": {
                "is_string": false,
                "is_number": true
              }
            }
          ]
        }
      }
    }
  }
}
```

## Generated Output

Run the generator:

```bash
codepurify generate
```

Result in `output/user.dto.ts`:

```ts
export interface User {
  email: string;
  age: number;
}
```

## How It Works

1. `{! entity.names.casing.pascal !}` → "User"
2. `{!#each entity.fields.arrays.all.items!}` → loops through fields
3. `{! names.casing.camel !}` → field name in camelCase
4. `{!#if flags.is_string!}` → conditionally renders "string"
