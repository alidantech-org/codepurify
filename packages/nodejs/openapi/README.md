# codepot-openapi

TypeScript-first OpenAPI 3.1 contract builder with Zod-backed reusable refs, route builders, compiler-resolved `x-codegen` metadata, and JSON/YAML output.

## Install

```bash
pnpm add codepot-openapi zod
```

```bash
npm install codepot-openapi zod
```

`zod` is a peer dependency.

## Quick Start

```ts
// package.config.ts
import { ContentType, HttpMethod, definePackageConfig, defineVersionContract } from 'codepot-openapi';
import { z } from 'zod';

const v1 = defineVersionContract({
  info: {
    title: 'Example API',
    version: 'v1',
  },
  defaults: {
    requestContentType: ContentType.json,
    responseContentType: ContentType.json,
  },
});

const sharedProps = v1.defineProperties('Shared', {
  mongoId: z.string().regex(/^[a-f\d]{24}$/i),
  success: z.boolean(),
  message: z.string().min(1).max(500),
});

const sharedSchemas = v1.defineSchemas({
  ApiMessage: {
    success: sharedProps.ref.success,
    message: sharedProps.ref.message,
  },
});

const users = v1.defineResource({
  name: 'users',
  route: 'v1/users',
  folders: ['platform'],
  ui: {
    enabled: true,
    infer: true,
  },
});

const userProps = users.defineProperties('User', {
  email: z.string().email(),
  name: z.string().min(1).max(100),
  status: z.enum(['active', 'suspended']),
});

const userBaseSchemas = users.defineSchemas({
  UserPublic: {
    id: sharedProps.ref.mongoId,
    email: userProps.ref.email,
    name: userProps.ref.name,
    status: userProps.ref.status,
  },
});

const userProjectionSchemas = users.defineSchemas({
  UserPreview: userBaseSchemas.ref.UserPublic.pick({
    id: true,
    email: true,
    name: true,
  }),
  UpdateUserBody: userBaseSchemas.ref.UserPublic.pick({
    name: true,
    status: true,
  }).partial(),
});

const userResponseSchemas = users.defineSchemas({
  UserResponse: sharedSchemas.ref.ApiMessage.extendWith({
    user: userBaseSchemas.ref.UserPublic,
  }),
  UserListResponse: sharedSchemas.ref.ApiMessage.extendWith({
    users: userProjectionSchemas.ref.UserPreview.array(),
  }),
});

users.defineRoutes((r) =>
  r
    .get('/', 'listUsers')
    .summary('List users')
    .response(userResponseSchemas.ref.UserListResponse)
    .ui('list')
    .done()

    .get('/:userId', 'getUserById')
    .params({ userId: sharedProps.ref.mongoId })
    .summary('Get user by ID')
    .response(userResponseSchemas.ref.UserResponse)
    .ui('detail')
    .done()

    .patch('/:userId', 'updateUser')
    .params({ userId: sharedProps.ref.mongoId })
    .summary('Update user')
    .body(userProjectionSchemas.ref.UpdateUserBody)
    .response(userResponseSchemas.ref.UserResponse)
    .ui('update')
    .done(),
);

export default definePackageConfig({
  contracts: [v1],
  output: {
    folder: 'openapi',
    filePrefix: 'openapi',
    formats: ['json', 'yaml'],
  },
});
```

Generate files:

```bash
pnpm exec codepot-openapi generate
```

Typical output:

```txt
openapi/contract-debug.v1.json
openapi/openapi.v1.json
openapi/openapi.v1.yaml
```

## Current API Shape

### Version Contracts

Use a version contract for one OpenAPI document.

```ts
const v1 = defineVersionContract({
  info: {
    title: 'Example API',
    version: 'v1',
  },
});
```

Global shared refs can be defined directly on the version. You no longer need a fake `Shared` resource.

```ts
const sharedProps = v1.defineProperties('Shared', {
  dateTime: z.string().datetime(),
  email: z.string().email(),
  success: z.boolean(),
  message: z.string(),
});

const sharedSchemas = v1.defineSchemas({
  ApiMessage: {
    success: sharedProps.ref.success,
    message: sharedProps.ref.message,
  },
});
```

### Resources

Resources own domain-specific properties, schemas, components, and routes.

```ts
const users = v1.defineResource({
  name: 'users',
  route: '/users',
  folders: ['platform'],
});
```

The compiler normalizes final OpenAPI paths. These all work:

```ts
route: 'v1/users'
route: '/v1/users'
route: '///v1//users/'
```

Route params use Express/Nest style in contracts and compile to OpenAPI style:

```ts
path: '/:userId'
// OpenAPI path: /users/{userId}
```

### Properties

`defineProperties(name, fields)` accepts a Zod map and returns reusable property refs.

```ts
const userProps = users.defineProperties('User', {
  email: z.string().email(),
  status: z.enum(['active', 'suspended']),
});
```

Usage helpers:

```ts
userProps.ref.email.optional()
userProps.ref.email.nullable()
userProps.ref.status.array()
```

Version-authored properties compile as shared metadata. Resource-authored properties keep resource metadata in `x-codegen`.

### Schemas

Schemas are reusable DTO components. Multiple `defineSchemas()` calls merge into the same registry.

```ts
const base = users.defineSchemas({
  UserPublic: {
    id: sharedProps.ref.mongoId,
    email: userProps.ref.email,
  },
});

const responses = users.defineSchemas({
  UserResponse: sharedSchemas.ref.ApiMessage.extendWith({
    user: base.ref.UserPublic,
  }),
});
```

Schema refs support composition and projections:

```ts
const projections = users.defineSchemas({
  UserPreview: base.ref.UserPublic.pick({
    id: true,
    email: true,
  }),
  UpdateUserBody: base.ref.UserPublic.omit({
    id: true,
  }).partial(),
});
```

Projection helpers:

```ts
schemaRef.partial()
schemaRef.pick({ field: true })
schemaRef.omit({ field: true })
```

Projected refs are normal refs and can be projected again. Required fields are preserved correctly through projection chains.

### Routes

Object style:

```ts
users.defineRoutes({
  parameters: {
    userId: sharedProps.ref.mongoId,
  },
  routes: {
    getUserById: {
      method: HttpMethod.get,
      path: '/:userId',
      response: userResponseSchemas.ref.UserResponse,
      ui: 'detail',
    },
  },
});
```

Builder style:

```ts
users.defineRoutes((r) =>
  r
    .get('/', 'listUsers')
    .response(userResponseSchemas.ref.UserListResponse)
    .ui('list')
    .done()
    .post('/', 'createUser')
    .body(userBodySchemas.ref.CreateUserBody)
    .on(201, userResponseSchemas.ref.UserResponse)
    .ui('create')
    .done(),
);
```

### UI Metadata

UI intent is resolved by the OpenAPI compiler and emitted under `operation.x-codegen.ui`. Downstream generators should only read `x-codegen.ui`; they should not infer UI roles from method, path, or schema.

Resource-level UI:

```ts
ui: { enabled: false }
ui: { enabled: true, infer: true }
ui: { enabled: true, infer: false }
```

Operation-level UI:

```ts
ui: 'list'
ui: 'detail'
ui: 'create'
ui: 'update'
ui: 'delete'
ui: 'action'
ui: 'auth'
ui: { enabled: false }
ui: { role: 'auth' }
```

Safe compiler inference only happens when the resource has `ui: { enabled: true, infer: true }`.

```txt
GET    /resource       -> list
GET    /resource/{id}  -> detail
POST   /resource       -> create
PATCH  /resource/{id}  -> update
PUT    /resource/{id}  -> update
DELETE /resource/{id}  -> delete
```

Example output:

```yaml
x-codegen:
  resource:
    name: auth
    path:
      - platform
  operation:
    name: adminLogin
    role: auth
  ui:
    enabled: true
    role: auth
    inferred: false
```

### Content Types

```ts
ContentType.json
ContentType.multipartFormData
ContentType.formUrlEncoded
ContentType.octetStream
ContentType.textPlain
ContentType.textHtml
ContentType.pdf
ContentType.png
ContentType.jpeg
ContentType.webp
ContentType.svg
```

Example multipart body:

```ts
body: {
  schema: uploadSchemas.ref.UploadFileBody,
  contentType: ContentType.multipartFormData,
}
```

## CLI

```bash
codepot-openapi init
codepot-openapi generate
codepot-openapi validate
```

Useful options:

```bash
codepot-openapi generate --verbose
codepot-openapi generate --debug
codepot-openapi generate --silent
codepot-openapi generate --log-level debug
```

Recommended scripts:

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

## Programmatic Usage

```ts
import { OpenApiTs, compileOpenApi, generateOpenApi, validateOpenApiDocument } from 'codepot-openapi';
```

```ts
const result = compileOpenApi(v1.contract);

if (result.success) {
  console.log(result.document.paths);
}
```

## Publishing

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm pack:dry
npm publish --access public
```

Check before publishing:

- `package.json` version is correct
- `README.md` describes the current API
- `dist/` was rebuilt
- `npm pack --dry-run` includes only intended files

## Development

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

When using this package from another local project, rebuild after source changes because consumers load `dist`.
