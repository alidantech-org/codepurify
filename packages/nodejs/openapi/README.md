# codepot-openapi

Typed OpenAPI contract engine for TypeScript projects.

`codepot-openapi` lets you define OpenAPI 3.1 contracts in TypeScript using version builders, resource builders, reusable property refs, component registries, Zod-backed schema fields, and code generation metadata for SDK tooling.

## Why use it

- TypeScript-first API contracts instead of hand-written OpenAPI YAML
- Versioned contracts and resource-oriented route definitions
- Reusable schema, parameter, request body, and response components
- Shared primitives and entity models with public, selected, partial, and query variants
- Required, optional, nullable, and non-nullable ref usage helpers
- OpenAPI JSON/YAML output with optional Redocly validation
- CLI and programmatic API
- SDK-friendly `x-codegen` metadata

## Installation

```bash
npm install codepot-openapi zod
```

```bash
pnpm add codepot-openapi zod
```

`zod` is a peer dependency because contracts are authored with the same Zod version used by your application.

## Quick Start

Create a package config:

```bash
npx codepot-openapi init
```

Define a contract:

```ts
// package.config.ts
import { definePackageConfig, defineVersionContract, HttpMethod, schema } from 'codepot-openapi';
import { z } from 'zod';

const v1 = defineVersionContract({
  info: {
    title: 'Example API',
    version: '1.0.0',
    description: 'Example service contract',
  },
});

const users = v1.defineResource({
  key: 'users',
  name: 'User',
  basePath: '/users',
});

const userProps = users.defineProperties();

const userEntity = userProps.entity('User', {
  id: schema.primitive(z.string(), {
    description: 'User identifier',
  }),
  email: schema.primitive(z.string().email()),
  name: schema.primitive(z.string().min(1)),
});

const userResponses = users.components.defineResponses({
  UserOkResponse: {
    description: 'User response',
    schema: userEntity.ref.publicModel,
  },
});

users.defineRoutes({
  getUser: {
    method: HttpMethod.get,
    path: '/{userId}',
    summary: 'Get user',
    responses: {
      200: userResponses.ref.UserOkResponse,
    },
  },
});

export default definePackageConfig({
  contracts: [v1],
  output: {
    folder: 'openapi',
    filePrefix: 'openapi',
    formats: ['json', 'yaml'],
  },
  server: {
    url: 'https://api.example.com',
    description: 'Production API',
  },
});
```

Generate OpenAPI files:

```bash
npx codepot-openapi generate
```

By default the generator writes files such as:

```txt
openapi/contract-debug.1.0.0.json
openapi/openapi.1.0.0.json
openapi/openapi.1.0.0.yaml
```

## CLI

```bash
codepot-openapi init
codepot-openapi generate
codepot-openapi validate
```

Common options:

```bash
codepot-openapi generate --verbose
codepot-openapi generate --debug
codepot-openapi generate --silent
codepot-openapi generate --log-level debug
```

Recommended project scripts:

```json
{
  "scripts": {
    "openapi:init": "codepot-openapi init",
    "openapi:generate": "codepot-openapi generate",
    "openapi:validate": "codepot-openapi validate",
    "openapi": "npm run openapi:generate && npm run openapi:validate"
  }
}
```

## Public API

```ts
import {
  OpenApiTs,
  definePackageConfig,
  defineVersionContract,
  defineResource,
  schema,
  SchemaAccess,
  QueryOperator,
  HttpMethod,
  ParameterLocation,
  compileOpenApi,
  generateOpenApi,
  validateContract,
  validateOpenApiDocument,
} from 'codepot-openapi';
```

## Core Concepts

### Version contracts

A version contract describes one OpenAPI document version.

```ts
const v1 = defineVersionContract({
  info: {
    title: 'Example API',
    version: '1.0.0',
  },
});
```

### Resources

Resources group properties, components, and routes under a domain boundary.

```ts
const users = v1.defineResource({
  key: 'users',
  name: 'User',
  basePath: '/users',
});
```

### Properties

Properties are reusable schema fields.

```ts
const props = users.defineProperties();

const shared = props.shared('SharedPrimitives', {
  id: schema.primitive(z.string()),
  dateTime: schema.primitive(z.string().datetime()),
});

const user = props.entity('User', {
  id: shared.ref.id,
  email: schema.primitive(z.string().email()),
});
```

Refs can be adjusted at the usage site:

```ts
phone: user.ref.fields.phone.optional().nullable();
```

### Components

OpenAPI components are split by bucket:

```txt
components.schemas
components.parameters
components.requestBodies
components.responses
```

Use schema components for reusable DTO shapes, and wrapper components for parameters, request bodies, and responses.

```ts
const params = users.components.defineParameters({
  UserIdPathParam: {
    name: 'userId',
    in: ParameterLocation.path,
    required: true,
    schema: shared.ref.id,
  },
});
```

### Routes

```ts
users.defineRoutes({
  parameters: {
    '/{userId}': [params.ref.UserIdPathParam],
  },
  routes: {
    getUser: {
      method: HttpMethod.get,
      path: '/{userId}',
      summary: 'Get user',
      responses: {
        200: userResponses.ref.UserOkResponse,
      },
    },
  },
});
```

## Programmatic Usage

```ts
import { OpenApiTs } from 'codepot-openapi';
import config from './package.config.js';

const openapi = new OpenApiTs();

await openapi.generate({ config });
```

Lower-level helpers are also exported:

```ts
import { compileOpenApi, generateOpenApi, validateOpenApiDocument } from 'codepot-openapi';
```

## Publishing Checklist

Before publishing a release:

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm pack:dry
npm publish --access public
```

Also check:

- `package.json` version is correct
- `README.md` describes the released behavior
- `LICENSE` is included
- `dist/` contains `index.js`, `index.cjs`, declarations, and `cli/index.js`
- `npm pack --dry-run` only includes intended files

## Development

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

During local development, a consuming project can use a link dependency:

```json
{
  "devDependencies": {
    "codepot-openapi": "link:C:/Users/peter/Projects/packages/codepurify/packages/nodejs/openapi"
  }
}
```

Rebuild this package after source changes because consumers load the compiled `dist` files.
