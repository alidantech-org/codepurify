# Tempura

Convention-locked NestJS backend generator.

---

## Purpose

Tempura generates predictable, production-grade NestJS backend code from strict project conventions.

It is built to eliminate:

- repeated file copying
- inconsistent architecture
- AI-generated drift
- surprise files
- broken patterns
- manual boilerplate work

---

## Core Idea

```txt id="5j9ysu"
tempura.config.js
      ↓
entity files
      ↓
context builder
      ↓
templates
      ↓
generated NestJS code
```

---

## Philosophy

Generated code should be:

- readable
- predictable
- traceable
- regeneratable
- convention-safe

Generated code is **visible source code**, not hidden runtime magic.

---

## Immutable vs Mutable

### Immutable (Generator Owned)

These files are fully generated and should not be edited manually:

- entities
- repositories
- generated DTOs
- generated services
- generated controllers
- generated modules

### Mutable (Developer Owned)

These files are safe extension points:

- use-cases
- custom business logic
- additional DTOs
- permission hooks
- decorators
- custom validators

---

## Features

### Convention Locking

Enforces:

- naming conventions
- folder structure
- imports
- decorators
- file placement
- generated architecture

---

### Entity Parsing

Detects:

- primitive field types
- relations
- enums
- foreign keys
- config constants
- exports/imports
- invalid definitions

---

### Context Building

Builds complete entity context:

```txt id="qb4l4d"
camelCase
PascalCase
snake_case
kebab-case
SHOUTING_CASE
plural
singular
```

And grouped field metadata:

```txt id="gwyjlwm"
string fields
number fields
boolean fields
relations
enums
foreign keys
```

---

### Template Generation

Generates:

- entities
- repositories
- DTOs
- services
- controllers
- modules
- use-cases
- guards
- decorators

---

### Safety Systems

Supports:

- immutable validation
- backup before overwrite
- rollback
- manifest tracking
- generation history
- git integration

---

## Installation

```bash id="24dyyg"
npm install -D tempura
```

---

## Commands

```bash id="gtjlwm"
npx tempura init
npx tempura generate
npx tempura check
npx tempura rollback
npx tempura clean
```

---

## Example Config

```js id="1h98ti"
// tempura.config.js

const { defineTempuraConfig } = require('tempura');

module.exports = defineTempuraConfig({
  project: {
    name: 'my-nest-app',
    rootDir: '.',
    sourceDir: 'src',
  },

  nest: {
    modulesDir: 'src/modules',
    entityPattern: '**/*.entity.ts',
    generatedDirName: '__generated__',
    customDirName: 'custom',
  },

  immutable: {
    enabled: true,
    include: ['__generated__/**/*.ts'],
  },

  mutable: {
    include: ['custom/**/*.ts'],
  },

  formatting: {
    prettier: true,
    eslint: true,
    tsc: true,
  },

  git: {
    enabled: true,
    requiredBranch: 'generated',
    preventDirtyCheckout: true,
  },
});
```

---

## Recommended Project Structure

```txt id="k2n8w9"
src/
  modules/
    users/
      user.entity.ts

      __generated__/
        user.repository.ts
        user.service.ts
        user.controller.ts
        dto/

      custom/
        use-cases/
        hooks/
        permissions/
```

---

## Generated File Ownership

Generated files include trace metadata:

```txt id="ru3p9w"
AUTO-GENERATED
source: user.entity.ts
template: service.template
generator: tempura@0.1.0
```

This enables:

- regeneration
- drift detection
- rollback
- debugging
- traceability

---

## Long-Term Vision

Tempura aims to become:

```txt id="wb1t4m"
backend architecture compiler
```

Where developers define:

```txt id="y6oqem"
domain intent
```

and Tempura produces:

```txt id="wbhjpm"
safe
repeatable
production-grade
convention-locked backend code
```

with no architectural drift.
