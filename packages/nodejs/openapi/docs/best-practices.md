# Codepot Contract Authoring Guideline: Ref-First, Projection-First, No Barrel Objects

## 1. Export refs directly

Prefer exporting the `.ref` result directly.

Good:

```ts
export const sharedPropsRef = v1.defineProperties('Shared', {
  uuid: z.uuid(),
  email: z.email(),
  phone: z.string().min(7).max(20),
}).ref;
```

Good:

```ts
export const baseSchemasRef = v1.defineSchemas({
  BaseEntity: {
    id: sharedPropsRef.uuid,
    createdAt: sharedPropsRef.dateTime,
    updatedAt: sharedPropsRef.dateTime,
  },
}).ref;
```

Avoid this pattern:

```ts
const sharedProps = v1.defineProperties('Shared', { ... });

export const sharedContract = {
  sharedProps,
  baseSchemas,
  transportSchemas,
};
```

Do not create large barrel objects that rename or re-wrap schema registries. They can cause TypeScript errors like:

```txt
The inferred type of this node exceeds the maximum length the compiler will serialize.
An explicit type annotation is needed.
```

The preferred contract usage should be:

```ts
sharedPropsRef.uuid
baseSchemasRef.BaseEntity
transportSchemasRef.ApiError
```

not:

```ts
sharedContract.sharedProps.ref.uuid
sharedContract.baseSchemas.ref.BaseEntity
```

---

## 2. Use the `Ref` suffix for exported refs

Use names like:

```ts
sharedPropsRef
baseSchemasRef
transportSchemasRef
sharedSchemasRef
authContextSchemasRef
baseAccessRef
userPropsRef
userAccessRef
userRoutesRef
```

This makes it clear that consumers are using the ref layer directly.

---

## 3. Do not export schemas that are local to the file

Body schemas and response schemas are usually local to the resource file.

Prefer:

```ts
const userBodySchemasRef = users.defineSchemas({
  CreateUserBody: { ... },
  UpdateUserBody: { ... },
}).ref;
```

Prefer:

```ts
const userResponseSchemasRef = users.defineSchemas({
  UserResponse: { ... },
  UsersListResponse: { ... },
}).ref;
```

Do not export them unless another contract must consume them.

Use a comment marker:

```ts
/**
 * ---------------------------------------------------------------------------
 * User Response Schemas @noExport
 * ---------------------------------------------------------------------------
 */
```

and:

```ts
/**
 * ---------------------------------------------------------------------------
 * User Body Schemas @noExport
 * ---------------------------------------------------------------------------
 */
```

This keeps the public contract surface small.

---

## 4. Export only what other contract files actually need

Usually export:

```ts
export const users = ...
export const userPropsRef = ...
export const userAccessRef = ...
export const userRoutes = ...
```

Only export schemas that are reused by another resource, such as:

```ts
export const userBaseSchemasRef = ...
export const userProjectionSchemasRef = ...
export const userRouteSchemasRef = ...
export const userQuerySchemasRef = ...
```

Do not export everything by default.

---

## 5. Prefer global smart props

Global props should be reusable, validated, and meaningful.

Good:

```ts
export const sharedPropsRef = v1.defineProperties('Shared', {
  uuid: z.uuid(),
  token: z.string().min(1).max(500),
  email: z.email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(8).max(100),
  url: z.url().max(500),
  title: z.string().min(1).max(120),
  description: z.string().max(500),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  dateTime: z.iso.datetime(),
  boolean: z.boolean(),
  paginationNumber: z.number().max(1000).min(0),
  sort: z.enum(['asc', 'desc']).default('asc'),
  message: z.string().min(1).max(500).default(''),
  statusCode: z.number().min(100).max(599),
  username: z.string().min(1).max(100),
  displayName: z.string().min(1).max(255),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roleName: z.string().min(1).max(120),
  identityValue: z.string().min(1).max(255),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
}).ref;
```

Avoid relying on generic `string` props everywhere.

Bad:

```ts
title: sharedPropsRef.string
email: sharedPropsRef.string
phone: sharedPropsRef.string
```

Good:

```ts
title: sharedPropsRef.title
email: sharedPropsRef.email
phone: sharedPropsRef.phone
```

Every prop should explain why that field exists.

---

## 6. Keep local props only for local enums/defaulted special fields

Resource props should mostly contain local enums and special resource-owned fields.

Good:

```ts
export const userPropsRef = users.defineProperties('User', {
  accessRole: z.enum(USER_ACCESS_ROLES),
  type: z.enum(USER_TYPES).default('user'),
  status: z.enum(USER_STATUSES).default('active'),
  metadata: z.record(z.string(), z.unknown()),
}).ref;
```

Avoid redefining reusable fields like username, email, phone, URL, title, and description locally if shared props already define them.

---

## 7. Use short prop keys inside named prop groups

The compiler combines the prop group name and prop key.

Bad:

```ts
users.defineProperties('User', {
  userStatus: z.enum(...),
  userType: z.enum(...),
});
```

This can emit names like:

```ts
UserUserStatus
UserUserType
```

Good:

```ts
users.defineProperties('User', {
  status: z.enum(...),
  type: z.enum(...),
});
```

This emits cleaner names:

```ts
UserStatus
UserType
```

---

## 8. Prefer projections over redefining DTO fields

Bodies, queries, public schemas, and partial schemas should mostly be derived from parent schemas.

Good:

```ts
const userProjectionSchemasRef = users.defineSchemas({
  UserPartial: userBaseSchemasRef.UserPublic.partial(),

  UserFilterable: userBaseSchemasRef.UserPublic
    .pick({
      type: true,
      status: true,
      username: true,
      isActive: true,
    })
    .partial(),
}).ref;
```

Avoid manually redefining the same fields again and again.

This prevents schema inconsistency when validation changes.

---

## 9. Do not name real base schemas as `Partial`, `Public`, `Body`, or `Query`

A schema named `Partial`, `Public`, `Body`, or `Query` should usually be a projection.

Bad:

```ts
UserPartial: {
  id: sharedPropsRef.uuid,
  username: sharedPropsRef.username,
}
```

Good:

```ts
User: {
  id: sharedPropsRef.uuid,
  username: sharedPropsRef.username,
  status: userPropsRef.status,
}

UserPartial: userSchemasRef.User.partial()
```

Real field definitions should live in the parent/base schema.

---

## 10. Use global and resource-level tags

Avoid repeating common tags on every route.

Good:

```ts
export const users = v1.defineResource({
  name: 'users',
  route: '/auth/users',
  folders: ['auth'],
  tags: ['admin', 'users'],
  ui: { enabled: true, infer: true },
});
```

Then route tags should only add meaningful route-specific metadata:

```ts
deleteUser: r
  .delete('/:id')
  .tags(['dangerous', 'mutation'])
```

Do not repeat:

```ts
.tags(['admin', 'users', 'dangerous', 'mutation'])
```

if `admin` and `users` already exist on the resource.

---

## 11. Keep `x-codegen` as the Codepot semantic layer

`x-codegen` is not a bug or random dumping ground. It is Codepot’s portable semantic layer embedded inside OpenAPI.

Use it for Codepot-only concepts like:

```txt
resource metadata
operation metadata
access ownership
context metadata
route sources
field sources
UI hints
generator tags
effects
```

OpenAPI is the familiar carrier format. Codepot metadata belongs in `x-codegen`.

---

## 12. Keep route definitions clean

Use object-key operation IDs.

Good:

```ts
export const userRoutes = users
  .defineRoutes()
  .params(userRouteSchemasRef.UserRouteParams)
  .routes((r) => ({
    findUsers: r
      .get('/')
      .response(userResponseSchemasRef.UsersListResponse),

    getUserById: r
      .get('/:id')
      .response(userResponseSchemasRef.UserDetailResponse),
  }));
```

Do not use old APIs:

```ts
r.get('/', 'findUsers')
.done()
.params(...)
```

---

## 13. Prefer route sources over repeated field-source config

Define selectable/reference values at the route.

Good:

```ts
findUsers: r
  .get('/')
  .response(userResponseSchemasRef.UsersListResponse)
  .source('users', (user) => user.key('id').label('username'))
```

Then consume it simply:

```ts
createdByUserId: sharedPropsRef.uuid.source(userRoutes.ref.findUsers)
```

Do not repeat noisy config:

```ts
{
  collection: 'users',
  value: 'id',
  label: 'username',
}
```

---

## 14. Avoid local exports unless they are part of the resource contract surface

Good local-only pattern:

```ts
const userBodySchemasRef = users.defineSchemas({
  CreateUserBody: { ... },
  UpdateUserBody: { ... },
}).ref;

const userResponseSchemasRef = users.defineSchemas({
  UserResponse: { ... },
  UsersListResponse: { ... },
}).ref;
```

Good exported pattern:

```ts
export const userRoutes = users.defineRoutes()...
export const userAccessRef = users.defineAccess(...).ref;
```

Export what other files need. Keep the rest private.

---

## 15. No barrel object that renames schema groups

Avoid:

```ts
export const userContract = {
  resource: users,
  props: userPropsRef,
  access: userAccessRef,
  schemas: {
    base: userBaseSchemasRef,
    projections: userProjectionSchemasRef,
    responses: userResponseSchemasRef,
  },
};
```

Prefer direct named exports:

```ts
export const users = ...
export const userPropsRef = ...
export const userAccessRef = ...
export const userRoutes = ...
export const userBaseSchemasRef = ...
export const userProjectionSchemasRef = ...
```

This avoids huge inferred object types and keeps imports explicit.

---

## 16. Use `@noExport` comments for local-only schema sections

Mark local-only sections clearly:

```ts
/**
 * ---------------------------------------------------------------------------
 * User Body Schemas @noExport
 * ---------------------------------------------------------------------------
 */

const userBodySchemasRef = users.defineSchemas({ ... }).ref;
```

```ts
/**
 * ---------------------------------------------------------------------------
 * User Response Schemas @noExport
 * ---------------------------------------------------------------------------
 */

const userResponseSchemasRef = users.defineSchemas({ ... }).ref;
```

This makes review easier and prevents accidental public surface growth.



NOW WE NEED TO START A  NEW PLAN, HOW DO WE SUPPORT ?? 

entity generation cleanly from schema, I was thinking of a define entity, that takes in a schema

and then lets user access fields modify them or event do nothing if it is straight forward also eg support relation to other entities eg v1.defineEntity or resource x.define entities ((e) => ({

name/key: e.fields. ... some rules TBD, advice also, I need to approve

as a projection of a schema and with usage rules, which can be minor and with x-kind entity

this can ensure it is not available in frontend and only generated in maybe backend and db layers:

this must remain light weight as it can rely on existing  metadata form the actual schema