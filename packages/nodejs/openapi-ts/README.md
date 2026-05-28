# @codepurify/openapi-ts

Typed OpenAPI contract engine for TypeScript projects.

This package lets backend projects define OpenAPI contracts using TypeScript-first builders, reusable property refs, resource orchestrators, component registries, and SDK-aware metadata.

The goal is to generate clean OpenAPI 3.1 output that is friendly to SDK generators.

---

# Current status

The package is currently in active local development.

Working so far:

- Standalone npm package structure
- CLI with `init` and `generate`
- `package.config.ts` loading through CLI
- Version contracts
- Resource contracts
- Resource-level properties
- Shared properties
- Entity properties
- `forRef` property groups
- Schema components
- Parameter components
- Request body components
- Response components
- Default responses at version level
- Route compilation
- OpenAPI JSON/YAML writing
- OpenAPI validation
- SDK metadata emission
- `optional()`, `required()`, `nullable()`, `nonNullable()` ref usage methods
- Query behavior metadata
- Access/select metadata
- Response/request/parameter buckets
- Route-level query and params support
- `defineRoutes({ parameters, routes })` support for shared path-level parameters
- Natural operation IDs
- Enum detection plan
- Ref-as-pointer plan
- Entity inheritance plan

---

# Package structure

```txt
packages/openapi-ts/
  package.json
  tsconfig.json
  README.md
  src/
    api/
    cli/
    compiler/
    components/
    config/
    generator/
    ids/
    naming/
    openapi/
    output/
    properties/
    refs/
    resource/
    routes/
    schema/
    sdk/
    validation/
    validator/
    version/
    writer/
    index.ts
```

---

# Installation for local development

Inside the package:

```bash
cd /c/Users/peter/Projects/packages/codepurify/packages/openapi-ts
npm install
npm run typecheck
npm run build
```

In a backend project, prefer `link:` while developing:

```json
{
  "devDependencies": {
    "@codepurify/openapi-ts": "link:C:/Users/peter/Projects/packages/codepurify/packages/openapi-ts"
  }
}
```

Then:

```bash
pnpm install
```

When package source changes, rebuild:

```bash
npm run typecheck
npm run build
```

The backend consumes `dist`, so rebuilding the package is required.

---

# CLI

The package exposes:

```bash
openapi-ts
```

## Initialize config

```bash
openapi-ts init
```

Creates:

```txt
package.config.ts
```

with:

```ts
import { definePackageConfig } from '@codepurify/openapi-ts';

export default definePackageConfig({
  contracts: [],
});
```

## Generate OpenAPI

```bash
openapi-ts generate
```

Reads:

```txt
package.config.ts
```

and writes configured OpenAPI files.

Example backend scripts:

```json
{
  "scripts": {
    "openapi:init": "openapi-ts init",
    "openapi:generate": "openapi-ts generate",
    "openapi:lint": "redocly lint openapi/openapi.v1.json",
    "openapi": "pnpm openapi:generate && pnpm openapi:lint"
  }
}
```

---

# Public API

Main imports:

```ts
import {
  definePackageConfig,
  defineVersionContract,
  schema,
  HttpMethod,
  SchemaAccess,
  QueryBehavior,
  ParameterLocation,
} from '@codepurify/openapi-ts';
```

---

# Package config

A backend project defines contracts in:

```txt
package.config.ts
```

Example:

```ts
export default definePackageConfig({
  contracts: [v1],
  output: {
    folder: 'openapi',
    filePrefix: 'openapi',
    formats: ['json', 'yaml'],
  },
  server: {
    url: 'https://api.example.com',
    description: 'API',
  },
});
```

Output files:

```txt
openapi/contract-debug.v1.json
openapi/openapi.v1.json
openapi/openapi.v1.yaml
```

---

# Version contract

```ts
const v1 = defineVersionContract({
  info: {
    title: 'RideRescue API',
    version: 'v1',
    description: 'RideRescue backend API',
    license: {
      name: 'MIT',
      identifier: 'MIT',
    },
  },
});
```

Version contracts can define:

- resources
- shared schema components
- shared parameter components
- shared request body components
- shared response components
- default responses

---

# Resources

```ts
const users = v1.defineResource({
  key: 'users',
  name: 'User',
  basePath: '/users',
});
```

A resource exposes:

```ts
users.defineProperties();
users.components.defineSchemas();
users.components.defineParameters();
users.components.defineRequestBodies();
users.components.defineResponses();
users.defineRoutes();
```

---

# Properties

Properties define reusable OpenAPI schema fields.

## Shared properties

```ts
const sharedProps = shared.defineProperties();

const sharedPrimitives = sharedProps.shared('SharedPrimitives', {
  mongoId: schema.primitive(z.string().regex(/^[a-f\d]{24}$/i), {
    description: 'Mongo ObjectId',
  }),
  dateTime: schema.primitive(z.string().datetime(), {
    description: 'ISO datetime',
  }),
  displayName: schema.primitive(z.string().min(1), {
    description: 'Display name',
  }),
});
```

Rules:

- `.shared()` fields are shared SDK fields.
- They should emit `x-sdk-shared: true`.
- Primitive schemas should emit `x-sdk-kind: primitive`.
- Primitive schemas should emit `x-sdk-skip: true`.
- Zod enums should emit `x-sdk-kind: enum` and `x-sdk-skip: false`.

## forRef properties

Use `forRef()` for reusable parameter/path/query-specific refs.

```ts
const userRefs = userProps.forRef('UserRefs', {
  userId: sharedPrimitives.ref.mongoId,
  status: schema.primitive(z.enum(['active', 'suspended', 'deleted']), {
    required: false,
  }),
});
```

## Entity properties

```ts
const userEntity = userProps.entity<User>(
  'User',
  {
    email: schema.primitive(z.string().email()),
    name: sharedPrimitives.ref.displayName,
    passwordHash: schema.primitive(z.string(), {
      access: SchemaAccess.secret,
    }),
  },
  {
    extends: baseEntityFields.ref,
  },
);
```

Entity refs expose:

```ts
userEntity.ref.fields.email;
userEntity.ref.model;
userEntity.ref.publicModel;
userEntity.ref.selectedModel;
userEntity.ref.partialModel;
userEntity.ref.query.exact;
userEntity.ref.query.search;
userEntity.ref.query.exactSearch;
userEntity.ref.query.range;
userEntity.ref.query.in;
userEntity.ref.query.exists;
userEntity.ref.query.sort;
```

Deep query field access is intentionally not supported.

Do not use:

```ts
userEntity.ref.sort.email;
```

Use:

```ts
userEntity.ref.query.sort;
```

---

# Schema fields

## Primitive

```ts
schema.primitive(z.string(), {
  description: 'Name',
  required: true,
  nullable: false,
  select: true,
  access: SchemaAccess.public,
  query: {
    methods: [QueryBehavior.search],
    sort: true,
  },
});
```

## Composite

```ts
schema.composite(
  {
    lat: schema.primitive(z.number()),
    lng: schema.primitive(z.number()),
  },
  {
    required: false,
  },
);
```

---

# Required, optional, and nullable

These concepts are separate.

```txt
required  = appears in OpenAPI required[]
optional  = does not appear in OpenAPI required[]
nullable  = value may be null
```

Supported ref methods:

```ts
ref.optional();
ref.required();
ref.nullable();
ref.nonNullable();
ref.optional().nullable();
```

Examples:

```ts
phone: userEntity.ref.fields.phone.optional().nullable();
```

Means:

```txt
phone is not required
phone can be null if present
```

---

# Access and select

Access levels:

```ts
SchemaAccess.public;
SchemaAccess.auth;
SchemaAccess.private;
SchemaAccess.secret;
SchemaAccess.internal;
SchemaAccess.system;
```

Default select behavior:

```txt
public   -> selected by default
auth     -> selected by default
private  -> not selected by default
secret   -> not selected by default
internal -> not selected by default
system   -> not selected by default
```

Users can override with:

```ts
select: true;
select: false;
```

---

# Query behavior

Supported query behaviors:

```ts
QueryBehavior.exact;
QueryBehavior.search;
QueryBehavior.exactSearch;
QueryBehavior.range;
QueryBehavior.in;
QueryBehavior.exists;
```

Example:

```ts
email: schema.primitive(z.string().email(), {
  query: {
    methods: [QueryBehavior.exactSearch, QueryBehavior.search],
    sort: true,
  },
});
```

Entity exposes method-level query refs:

```ts
userEntity.ref.query.exactSearch;
userEntity.ref.query.sort;
```

---

# Components

The engine separates OpenAPI components by bucket.

```txt
components.schemas
components.parameters
components.requestBodies
components.responses
```

Actual data shapes live in `components.schemas`.

Wrappers live in:

```txt
components.parameters
components.requestBodies
components.responses
```

This keeps SDK generation clean.

---

# Schema components

```ts
const sharedSchemas = v1.components.defineSchemas({
  ApiMessage: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
  },
});
```

Schema components are DTOs.

Expected metadata:

```yaml
x-sdk-kind: dto
x-sdk-shared: true
x-sdk-placement: global-shared
```

For resource-level schema components:

```ts
const userSchemas = users.components.defineSchemas({
  CreateUserBody: {
    email: userEntity.ref.fields.email,
    name: userEntity.ref.fields.name,
  },
});
```

---

# Parameter components

```ts
const sharedParams = v1.components.defineParameters({
  PageQueryParam: {
    name: 'page',
    in: ParameterLocation.query,
    schema: sharedPrimitives.ref.page,
  },
});
```

Parameter components are OpenAPI wrappers and should be skipped by SDK model generation.

Expected metadata:

```yaml
x-sdk-kind: dto
x-sdk-skip: true
```

---

# Request body components

```ts
const userBodies = users.components.defineRequestBodies({
  CreateUserRequestBody: {
    required: true,
    schema: userSchemas.ref.CreateUserBody,
  },
});
```

Expected OpenAPI:

```yaml
components:
  requestBodies:
    CreateUserRequestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateUserBody'
```

Request body wrappers should emit:

```yaml
x-sdk-kind: dto
x-sdk-skip: true
```

---

# Response components

```ts
const userResponses = users.components.defineResponses({
  UserOkResponse: {
    description: 'User response',
    schema: userEntity.ref.publicModel,
  },
});
```

Expected OpenAPI:

```yaml
components:
  responses:
    UserOkResponse:
      description: User response
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UserPublicModel'
```

Response wrappers should emit:

```yaml
x-sdk-kind: dto
x-sdk-skip: true
```

---

# Default responses

Version-level defaults:

```ts
v1.setDefaultResponses({
  400: sharedResponses.ref.BadRequestResponse,
  401: sharedResponses.ref.UnauthorizedResponse,
  403: sharedResponses.ref.ForbiddenResponse,
  422: sharedResponses.ref.ValidationErrorResponse,
  500: sharedResponses.ref.InternalServerErrorResponse,
});
```

Route responses override defaults.

---

# Routes

Routes support:

- method
- path
- summary
- description
- params
- query
- parameters
- body
- response
- responses

## Simple routes

```ts
users.defineRoutes({
  listUsers: {
    method: HttpMethod.get,
    path: '/',
    summary: 'List users',
    query: [sharedParams.ref.PageQueryParam, sharedParams.ref.LimitQueryParam],
    responses: {
      200: userResponses.ref.UsersListOkResponse,
    },
  },
});
```

## Nested routes with shared path parameters

```ts
users.defineRoutes({
  parameters: {
    '/:userId': [userParams.ref.UserIdPathParam],
  },
  routes: {
    getUserById: {
      method: HttpMethod.get,
      path: '/:userId',
      query: [sharedParams.ref.FieldsQueryParam, sharedParams.ref.PopulateQueryParam],
      responses: {
        200: userResponses.ref.UserOkResponse,
        404: sharedResponses.ref.NotFoundResponse,
      },
    },
  },
});
```

Path-level parameters compile to:

```yaml
/users/{userId}:
  parameters:
    - $ref: '#/components/parameters/UserIdPathParam'
```

Query parameters stay on operations:

```yaml
get:
  parameters:
    - $ref: '#/components/parameters/FieldsQueryParam'
    - $ref: '#/components/parameters/PopulateQueryParam'
```

---

# Operation naming

Expected output:

```yaml
operationId: listUsers
x-sdk-group: users
x-sdk-operation: list_users
```

Not:

```yaml
operationId: users.listUsers
x-sdk-operation: users.listUsers
```

---

# Ref-as-pointer rule

Refs should behave as pointers.

If a field is defined using another field ref, the compiler should not create a new primitive schema for the alias field.

Example:

```ts
const baseEntityFields = sharedProps.shared('BaseEntityFields', {
  id: sharedPrimitives.ref.mongoId,
  createdAt: sharedPrimitives.ref.dateTime,
  updatedAt: sharedPrimitives.ref.dateTime,
});
```

This should not create:

```txt
BaseEntityFieldsId
BaseEntityFieldsCreatedAt
BaseEntityFieldsUpdatedAt
```

Instead, model properties should point to the primary refs:

```yaml
id:
  $ref: '#/components/schemas/SharedPrimitivesMongoId'
createdAt:
  $ref: '#/components/schemas/SharedPrimitivesDateTime'
updatedAt:
  $ref: '#/components/schemas/SharedPrimitivesDateTime'
```

If usage changes:

```ts
id: sharedPrimitives.ref.mongoId.optional().nullable();
```

Then output should be:

```yaml
id:
  anyOf:
    - $ref: '#/components/schemas/SharedPrimitivesMongoId'
    - type: 'null'
```

and `id` should not be included in `required[]`.

---

# Entity inheritance

Entities can extend shared or forRef property groups.

Example:

```ts
const baseEntityFields = sharedProps.shared('BaseEntityFields', {
  id: sharedPrimitives.ref.mongoId,
  createdAt: sharedPrimitives.ref.dateTime,
  updatedAt: sharedPrimitives.ref.dateTime,
});

const userEntity = userProps.entity<User>(
  'User',
  {
    email: schema.primitive(z.string().email()),
    name: sharedPrimitives.ref.displayName,
  },
  {
    extends: baseEntityFields.ref,
  },
);
```

Final OpenAPI model stays flat:

```yaml
UserPublicModel:
  type: object
  properties:
    id:
      $ref: '#/components/schemas/SharedPrimitivesMongoId'
    createdAt:
      $ref: '#/components/schemas/SharedPrimitivesDateTime'
    updatedAt:
      $ref: '#/components/schemas/SharedPrimitivesDateTime'
    email:
      $ref: '#/components/schemas/UserEmail'
    name:
      $ref: '#/components/schemas/SharedPrimitivesDisplayName'
```

But SDK metadata records inheritance:

```yaml
x-sdk-inherits:
  - ref: '#/components/schemas/BaseEntityFields'
    fields:
      - id
      - createdAt
      - updatedAt
```

`x-sdk-inherits.ref` must be a valid OpenAPI ref.

---

# SDK metadata rules

## Primitive

```yaml
x-sdk-kind: primitive
x-sdk-skip: true
```

## Enum

If Zod enum:

```yaml
x-sdk-kind: enum
x-sdk-skip: false
```

Example:

```ts
schema.primitive(z.enum(['active', 'suspended', 'deleted']));
```

Expected:

```yaml
UserStatus:
  type: string
  enum:
    - active
    - suspended
    - deleted
  x-sdk-kind: enum
  x-sdk-skip: false
```

## Schema DTO

```yaml
x-sdk-kind: dto
x-sdk-skip: false
```

## Parameter/requestBody/response wrappers

```yaml
x-sdk-kind: dto
x-sdk-skip: true
```

## Shared

Anything from `.shared()` or version-level components:

```yaml
x-sdk-shared: true
x-sdk-group: shared
x-sdk-placement: global-shared
```

---

# Current known fixes still being completed

## 1. Enum detection

Zod enum primitives should emit:

```yaml
x-sdk-kind: enum
x-sdk-skip: false
```

instead of primitive/skip true.

## 2. Ref-as-pointer

Alias refs should resolve to their primary target refs.

This fixes unresolved refs like:

```txt
UserId
UserCreatedAt
VehicleId
VehicleCreatedAt
```

when they really point to shared fields like:

```txt
SharedPrimitivesMongoId
SharedPrimitivesDateTime
```

## 3. Inheritance metadata

Entity extension should emit:

```yaml
x-sdk-inherits:
  - ref: '#/components/schemas/BaseEntityFields'
    fields:
      - id
      - createdAt
      - updatedAt
```

## 4. Unused primitive warnings

Some primitive schemas may still show Redocly `no-unused-components` warnings even with `x-sdk-skip: true`.

This is acceptable during SDK-first generation, but later we can add:

```ts
compile: {
  emitUnusedSdkPrimitives: boolean;
}
```

---

# Testing checklist

After package changes:

```bash
npm run typecheck
npm run build
```

Then in backend:

```bash
pnpm openapi:generate
pnpm openapi:lint
```

Check generated YAML for:

```txt
operationId: listUsers
x-sdk-operation: list_users
x-sdk-kind: primitive on normal primitive schemas
x-sdk-kind: enum on enum schemas
x-sdk-skip: true on primitive schemas
x-sdk-skip: false or absent on enum schemas
x-sdk-kind: dto on schema components
x-sdk-skip: true on response/requestBody/parameter wrappers
x-sdk-shared: true on shared refs/components
x-sdk-inherits with valid OpenAPI ref
path-level params under /users/{userId}
query params under individual operations
requestBodies under components.requestBodies
responses under components.responses
```

---

# Example expected route output

```yaml
/users:
  get:
    summary: List users
    tags:
      - User
    security:
      - bearerAuth: []
    parameters:
      - $ref: '#/components/parameters/PageQueryParam'
      - $ref: '#/components/parameters/LimitQueryParam'
      - $ref: '#/components/parameters/SearchQueryParam'
    responses:
      '200':
        $ref: '#/components/responses/UsersListOkResponse'
      '400':
        $ref: '#/components/responses/BadRequestResponse'
      '401':
        $ref: '#/components/responses/UnauthorizedResponse'
      '403':
        $ref: '#/components/responses/ForbiddenResponse'
      '422':
        $ref: '#/components/responses/ValidationErrorResponse'
      '500':
        $ref: '#/components/responses/InternalServerErrorResponse'
    operationId: listUsers
    x-sdk-group: users
    x-sdk-operation: list_users
```

---

# Example expected path parameter output

```yaml
/users/{userId}:
  parameters:
    - $ref: '#/components/parameters/UserIdPathParam'
  get:
    summary: Get user by ID
    parameters:
      - $ref: '#/components/parameters/FieldsQueryParam'
      - $ref: '#/components/parameters/PopulateQueryParam'
    responses:
      '200':
        $ref: '#/components/responses/UserOkResponse'
      '404':
        $ref: '#/components/responses/NotFoundResponse'
    operationId: getUserById
    x-sdk-group: users
    x-sdk-operation: get_user_by_id
```

---

# Example expected schema output

```yaml
UserPublicModel:
  type: object
  properties:
    id:
      $ref: '#/components/schemas/SharedPrimitivesMongoId'
    createdAt:
      $ref: '#/components/schemas/SharedPrimitivesDateTime'
    updatedAt:
      $ref: '#/components/schemas/SharedPrimitivesDateTime'
    email:
      $ref: '#/components/schemas/UserEmail'
    name:
      $ref: '#/components/schemas/SharedPrimitivesDisplayName'
  required:
    - id
    - createdAt
    - updatedAt
    - email
    - name
  x-sdk-kind: model
  x-sdk-group: users
  x-sdk-resource: users
  x-sdk-inherits:
    - ref: '#/components/schemas/BaseEntityFields'
      fields:
        - id
        - createdAt
        - updatedAt
```

---

# Design principle

Keep OpenAPI valid and SDK-friendly:

```txt
Schemas define types.
Parameters/requestBodies/responses wrap schemas.
Refs point to primary schema definitions.
Usage wrappers only change required/nullable at the usage site.
SDK metadata is generated by the engine, not manually by the user.
```
