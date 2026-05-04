---
title: Project Structure
description: Recommended Codepurify project layout
---

# Project Structure

Organize your Codepurify project with this recommended layout.

## Folder Structure

```
my-project/
├── types/
│   ├── user.json
│   ├── product.json
│   └── order.json
├── templates/
│   ├── user.dto.hbs
│   ├── product.dto.hbs
│   └── order.dto.hbs
├── output/
│   ├── user.dto.ts
│   ├── product.dto.ts
│   └── order.dto.ts
└── codepurify.config.js
```

## Types Folder

Contains context definitions for your entities.

```json
{
  "entity": {
    "names": { ... },
    "fields": { ... },
    "relations": { ... }
  }
}
```

## Templates Folder

Contains Handlebars templates with `{! ... !}` syntax.

```hbs
export interface {! entity.names.casing.pascal !} {
  {!#each entity.fields.arrays.all.items!}
  {!names.casing.camel!}: {!#if flags.is_string}string{!/if!};
  {!/each!}
}
```

## Output Folder

Generated files are written here based on template configuration.

## Configuration

`codepurify.config.js` defines template mappings:

```js
module.exports = {
  templates: [
    {
      name: "user-dto",
      template: "templates/user.dto.hbs",
      output: "output/user.dto.ts",
      context: "types/user.json"
    }
  ]
};
```

## Template to Output Mapping

Each template maps to one output file. The template renders the context data into the final code.

Template → Context → Output
`user.dto.hbs` + `user.json` → `user.dto.ts`
