Implement Codepot entity metadata generation as a framework-neutral, storage-neutral contract feature.

Scope:

* Add shared/base entity definitions.
* Add resource-owned entity definitions.
* Add abstract base entities.
* Add concrete shared entities.
* Add entity inheritance through `.extends(...)`.
* Add typed field metadata overrides.
* Add backend-only fields through `.backend(...)`.
* Add framework-neutral relations.
* Add framework-neutral constraints.
* Emit all entity metadata under `x-codegen`.
* Do not generate ORM code in this patch.
* Do not add TypeORM, Prisma, Drizzle, Mongoose, SQL, MongoDB, or framework-specific syntax.

This feature must remain metadata-only. Templates decide how to generate ORM/database code later.

────────────────────────────────

1. Core model
   ────────────────────────────────

Codepot uses this separation:

```txt
Schema = data/API shape
Entity = backend/storage projection of a schema
```

Entities should derive from schemas instead of redefining fields.

Entity metadata is backend/storage-only by default. It must not be treated as frontend DTO metadata.

All entity metadata belongs in `x-codegen`.

────────────────────────────────
2. Definition sites
────────────────────────────────

Support two entity definition sites:

```txt
v1.defineBaseEntities(...)
resource.defineEntities(...)
```

Use `v1.defineBaseEntities(...)` for:

* abstract shared bases
* concrete shared entities that do not belong to one resource

Use `resource.defineEntities(...)` for:

* entities owned by a resource

Examples:

```ts
export const baseEntitiesRef = v1.defineBaseEntities({ ... }).ref;
```

```ts
export const userEntitiesRef = users.defineEntities({ ... }).ref;
```

Do not force all entities to be resource-owned. Shared base entities must be global.

────────────────────────────────
3. Abstract base entities
────────────────────────────────

Abstract bases contribute field metadata only.

They do not have stores/tables/collections.

They are never generated as standalone concrete storage models.

Important: abstract bases must have a typed field source.

Do not design this:

```ts
BaseEntity: e
  .abstract()
  .fields((f) => ({
    id: f.id.unique(),
  }))
```

because `f` has no source.

Use this:

```ts
export const baseEntitiesRef = v1.defineBaseEntities({
  BaseEntity: {
    kind: 'abstract',
    schema: baseSchemasRef.BaseEntity,
    fields: (f) => ({
      id: f.id.unique().index().role('primaryKey').generated('uuid'),
      createdAt: f.createdAt.role('createdAt'),
      updatedAt: f.updatedAt.role('updatedAt'),
    }),
  },

  SoftDeletable: {
    kind: 'abstract',
    schema: baseSchemasRef.SoftDeletable,
    fields: (f) => ({
      deletedAt: f.deletedAt.role('softDelete'),
    }),
  },

  Auditable: {
    kind: 'abstract',
    schema: baseSchemasRef.Auditable,
    fields: (f) => ({
      createdBy: f.createdBy.role('auditActor'),
      updatedBy: f.updatedBy.role('auditActor'),
    }),
  },
}).ref;
```

If builder syntax is supported, it must still provide the schema:

```ts
export const baseEntitiesRef = v1
  .defineBaseEntities()
  .entities((e) => ({
    BaseEntity: e
      .abstract(baseSchemasRef.BaseEntity)
      .fields((f) => ({
        id: f.id.unique().index().role('primaryKey').generated('uuid'),
        createdAt: f.createdAt.role('createdAt'),
        updatedAt: f.updatedAt.role('updatedAt'),
      })),

    SoftDeletable: e
      .abstract(baseSchemasRef.SoftDeletable)
      .fields((f) => ({
        deletedAt: f.deletedAt.role('softDelete'),
      })),
  })).ref;
```

Rules:

1. `.abstract(schemaRef)` has no store.
2. Abstract bases contribute field metadata only.
3. Abstract bases do not contribute relations.
4. Abstract bases do not contribute store names.
5. Abstract bases are not generated as standalone tables/models/collections.
6. Templates decide how to implement abstract inheritance.

────────────────────────────────
4. Concrete shared entities
────────────────────────────────

Some shared entities are real storage models but live globally.

Example:

```ts
export const sharedEntitiesRef = v1.defineBaseEntities({
  Media: {
    kind: 'entity',
    schema: sharedSchemasRef.Media,
    extends: [baseEntitiesRef.BaseEntity],
    store: 'media',
    fields: (f) => ({
      url: f.url.index(),
      mimeType: f.mimeType.index(),
    }),
  },
}).ref;
```

Rules:

1. Concrete shared entities have `kind: 'entity'`.
2. Concrete shared entities have a store.
3. Concrete shared entities can be referenced by resource-owned relations.
4. They still remain backend/storage metadata, not frontend DTOs.

────────────────────────────────
5. Resource-owned entities
────────────────────────────────

Resource entities are defined on the owning resource.

Example:

```ts
export const userEntitiesRef = users.defineEntities({
  User: {
    schema: userSchemasRef.User,
    extends: [baseEntitiesRef.BaseEntity, baseEntitiesRef.SoftDeletable],
    store: 'users',

    backend: {
      passwordHash: sharedPropsRef.token,
      refreshTokenHash: sharedPropsRef.token.optional().nullable(),
    },

    fields: (f) => ({
      username: f.username.unique().index(),
      status: f.status.index(),
      deletedAt: f.deletedAt.role('softDelete'),
    }),
  },

  UserRole: {
    schema: userSchemasRef.UserRole,
    extends: [baseEntitiesRef.BaseEntity],
    store: 'user_roles',

    fields: (f) => ({
      userId: f.userId.index(),
      role: f.role.index(),
      status: f.status.index(),
    }),
  },

  UserIdentity: {
    schema: userSchemasRef.UserIdentity,
    extends: [baseEntitiesRef.BaseEntity],
    store: 'user_identities',

    fields: (f) => ({
      userId: f.userId.index(),
      type: f.type.index(),
      value: f.value.index(),
    }),
  },
}).ref;
```

If builder syntax is supported:

```ts
export const userEntitiesRef = users
  .defineEntities()
  .entities((e) => ({
    User: e
      .entity(userSchemasRef.User)
      .extends(baseEntitiesRef.BaseEntity, baseEntitiesRef.SoftDeletable)
      .store('users')
      .backend({
        passwordHash: sharedPropsRef.token,
        refreshTokenHash: sharedPropsRef.token.optional().nullable(),
      })
      .fields((f) => ({
        username: f.username.unique().index(),
        status: f.status.index(),
        deletedAt: f.deletedAt.role('softDelete'),
      })),

    UserRole: e
      .entity(userSchemasRef.UserRole)
      .extends(baseEntitiesRef.BaseEntity)
      .store('user_roles')
      .fields((f) => ({
        userId: f.userId.index(),
        role: f.role.index(),
      })),
  })).ref;
```

Object style and builder style must normalize to the same internal entity model.

────────────────────────────────
6. Entity schemas must be persistence-clean
────────────────────────────────

Do not derive entities from public/API schemas that contain nested response arrays.

Bad:

```ts
User: {
  schema: userProjectionSchemasRef.UserPublic,
  store: 'users',
}
```

if `UserPublic` contains:

```ts
roles: UserRolePublic.array()
identities: UserIdentityPublic.array()
```

Good:

```ts
User: {
  schema: userSchemasRef.User,
  store: 'users',
}
```

Then API views are projections:

```ts
export const userProjectionSchemasRef = users.defineSchemas({
  UserPublic: userSchemasRef.User.extendWith({
    roles: userSchemasRef.UserRole.array().optional(),
    identities: userSchemasRef.UserIdentity.array().optional(),
  }),

  UserPartial: userSchemasRef.User.partial(),
}).ref;
```

Rules:

1. Entity schemas should represent storage columns/fields.
2. Public schemas can add nested arrays and response-only projections.
3. Entities must not accidentally generate array columns for nested response relations.
4. Relations belong in entity relation metadata, not in the entity schema as array fields.

────────────────────────────────
7. Entity inheritance semantics
────────────────────────────────

Support `.extends(...)` or `extends: [...]`.

Example:

```ts
User: {
  schema: userSchemasRef.User,
  extends: [baseEntitiesRef.BaseEntity, baseEntitiesRef.SoftDeletable],
  store: 'users',
}
```

Rules:

1. `.extends(...)` accepts one or more base entity refs.
2. Order matters.
3. Later bases win over earlier bases on inherited field metadata conflict.
4. Child field declarations win over inherited field metadata.
5. `.extends(...)` contributes field metadata only.
6. Store names never inherit.
7. Relations never inherit.
8. Backend-only fields never inherit unless explicitly declared on the child.
9. Templates own how inheritance is implemented.

Example override:

```ts
User: {
  schema: userSchemasRef.User,
  extends: [baseEntitiesRef.BaseEntity],
  store: 'users',
  fields: (f) => ({
    id: f.id.role('primaryKey').generated('cuid'),
  }),
}
```

The child override wins.

────────────────────────────────
8. Typed field overrides
────────────────────────────────

The `fields` builder must be typed from the entity schema.

Example:

```ts
fields: (f) => ({
  username: f.username.unique().index(),
  status: f.status.index(),
})
```

This should autocomplete only fields from the schema and inherited backend fields where applicable.

This should fail TypeScript if possible, or fail compiler validation:

```ts
fields: (f) => ({
  wrongField: f.wrongField.index(),
})
```

Field metadata methods to support:

```ts
f.field.index()
f.field.unique()
f.field.role('primaryKey')
f.field.role('createdAt')
f.field.role('updatedAt')
f.field.role('softDelete')
f.field.role('auditActor')
f.field.generated('uuid')
f.field.generated('increment')
f.field.generated('cuid')
```

Recommended type unions:

```ts
type EntityFieldRole =
  | 'primaryKey'
  | 'createdAt'
  | 'updatedAt'
  | 'softDelete'
  | 'auditActor';

type EntityGeneratedStrategy =
  | 'uuid'
  | 'increment'
  | 'cuid';
```

Keep this storage-neutral. Do not add SQL-specific or ORM-specific field options.

────────────────────────────────
9. Backend-only fields
────────────────────────────────

Use `.backend(...)`, not `.privateFields(...)`, not `.extend(...)`.

Example:

```ts
backend: {
  passwordHash: sharedPropsRef.token,
  refreshTokenHash: sharedPropsRef.token.optional().nullable(),
}
```

Builder syntax:

```ts
.backend({
  passwordHash: sharedPropsRef.token,
  refreshTokenHash: sharedPropsRef.token.optional().nullable(),
})
```

Meaning:

1. Backend fields are storage/backend-only.
2. Backend fields are not frontend DTOs.
3. Backend fields are not public response fields.
4. Backend fields are available to entity field overrides and constraints.
5. Backend fields emit under entity metadata, not normal API schema metadata.

Example:

```ts
User: {
  schema: userSchemasRef.User,
  store: 'users',
  backend: {
    passwordHash: sharedPropsRef.token,
  },
  fields: (f) => ({
    passwordHash: f.passwordHash.index(),
  }),
}
```

────────────────────────────────
10. Relations
────────────────────────────────

Relations should use entity refs only.

Do not use internal temporary refs like `e.ref.User`.

Use one consistent external ref style:

```ts
userEntitiesRef.User
userEntitiesRef.UserRole
sharedEntitiesRef.Media
```

Because entity refs must exist before relation definitions, support relations as a separate call after entity definitions:

```ts
users.defineEntityRelations({
  User: {
    roles: (r) =>
      r.hasMany(userEntitiesRef.UserRole)
        .local('id')
        .foreign('userId'),

    identities: (r) =>
      r.hasMany(userEntitiesRef.UserIdentity)
        .local('id')
        .foreign('userId'),
  },

  UserRole: {
    user: (r) =>
      r.belongsTo(userEntitiesRef.User)
        .local('userId')
        .foreign('id'),
  },

  UserIdentity: {
    user: (r) =>
      r.belongsTo(userEntitiesRef.User)
        .local('userId')
        .foreign('id'),
  },
});
```

Supported relation cardinality:

```ts
r.belongsTo(entityRef)
r.hasOne(entityRef)
r.hasMany(entityRef)
r.manyToMany(entityRef)
```

Relation builder:

```ts
.local('localField')
.foreign('foreignField')
```

Rules:

1. `local(...)` field must exist on the source entity.
2. `foreign(...)` field must exist on the target entity.
3. Relations do not imply API response nesting.
4. Relations do not imply database-specific cascade behavior yet.
5. Relation metadata is topology only.
6. Templates decide ORM/database implementation.

────────────────────────────────
11. Constraints API
────────────────────────────────

Add `.constraints(...)` or `constraints: (...) => ({ ... })`.

Purpose:

* composite indexes
* composite uniques
* named checks

Field-level `.index()` and `.unique()` remain for single-field metadata.

Use `.constraints()` for multi-field constraints and checks.

Example:

```ts
constraints: (c) => ({
  idx_user_status_type: c.index(['status', 'type']),

  idx_user_created_status: c.index(['createdAt', 'status']),

  uniq_user_username_appId: c.unique(['username', 'appId']),

  chk_user_dates_valid: c.check(
    c.and(
      c.notNull('createdAt'),
      c.when(
        c.notNull('deletedAt'),
        c.gt('deletedAt', c.field('createdAt')),
      ),
    ),
  ),
})
```

Builder syntax:

```ts
.constraints((c) => ({
  idx_identity_user_type: c.index(['userId', 'type']),

  uniq_identity_user_type_value: c.unique(['userId', 'type', 'value']),

  chk_identity_verified_at: c.check(
    c.when(
      c.eq('isVerified', true),
      c.notNull('verifiedAt'),
    ),
  ),
}))
```

Rules:

1. Constraint names are explicit.
2. Constraint names are stable identifiers.
3. Do not auto-generate constraint names.
4. Constraint names must be unique within an entity.
5. All referenced fields must exist on the entity, including backend fields and inherited fields.
6. No raw SQL.
7. No raw storage-specific expressions.
8. Templates decide how to implement each constraint.

Naming convention:

```txt
idx_entity_fields
uniq_entity_fields
chk_entity_meaning
```

Examples:

```txt
idx_user_status_type
uniq_identity_user_type_value
chk_identity_verified_at
```

────────────────────────────────
12. Predicate vocabulary for checks
────────────────────────────────

Support this neutral predicate vocabulary:

```ts
c.gt(field, value)
c.gte(field, value)
c.lt(field, value)
c.lte(field, value)
c.eq(field, value)
c.neq(field, value)
c.notNull(field)
c.oneOf(field, values)
c.range(field, min, max)
c.when(condition, thenCondition)
c.and(...conditions)
c.or(...conditions)
c.field(fieldName)
```

Examples:

```ts
c.check(
  c.oneOf('status', ['active', 'pending', 'disabled']),
)
```

```ts
c.check(
  c.when(
    c.eq('isVerified', true),
    c.notNull('verifiedAt'),
  ),
)
```

```ts
c.check(
  c.gt('deletedAt', c.field('createdAt')),
)
```

Serialized field refs should be explicit:

```yaml
value:
  $field: createdAt
```

Do not serialize field refs as plain strings where they can be confused with literal values.

────────────────────────────────
13. OpenAPI / x-codegen output
────────────────────────────────

Emit shared/base entities in `x-codegen.baseEntities` or equivalent global metadata.

Example:

```yaml
x-codegen:
  baseEntities:
    BaseEntity:
      kind: abstract
      schema:
        $ref: '#/components/schemas/BaseEntity'
      fields:
        id:
          unique: true
          index: true
          role: primaryKey
          generated: uuid
        createdAt:
          role: createdAt
        updatedAt:
          role: updatedAt

    SoftDeletable:
      kind: abstract
      schema:
        $ref: '#/components/schemas/SoftDeletable'
      fields:
        deletedAt:
          role: softDelete
```

Emit resource entities under `x-codegen.entities`.

Example:

```yaml
x-codegen:
  entities:
    users:
      User:
        kind: entity
        resource:
          name: users
          path:
            - auth
        schema:
          $ref: '#/components/schemas/User'
        extends:
          - owner:
              global: true
            key: BaseEntity
          - owner:
              global: true
            key: SoftDeletable
        store: users
        visibility:
          - backend
          - storage
        backend:
          passwordHash:
            $ref: '#/components/schemas/SharedToken'
          refreshTokenHash:
            anyOf:
              - $ref: '#/components/schemas/SharedToken'
              - type: 'null'
        fields:
          username:
            unique: true
            index: true
          status:
            index: true
          deletedAt:
            role: softDelete
        relations:
          roles:
            cardinality: hasMany
            target:
              owner:
                resource:
                  name: users
                  path:
                    - auth
              key: UserRole
            local: id
            foreign: userId
        constraints:
          idx_user_status_type:
            kind: index
            fields:
              - status
              - type
          uniq_user_username_appId:
            kind: unique
            fields:
              - username
              - appId
          chk_user_dates_valid:
            kind: check
            rule:
              op: and
              conditions:
                - op: notNull
                  field: createdAt
                - op: when
                  condition:
                    op: notNull
                    field: deletedAt
                  then:
                    op: gt
                    field: deletedAt
                    value:
                      $field: createdAt
```

Do not emit ORM/framework/database-specific metadata.

Forbidden in entity metadata:

* TypeORM
* Prisma
* Drizzle
* Mongoose
* SQL
* MongoDB
* decorator names
* column decorators
* table decorators
* raw SQL strings

────────────────────────────────
14. Visibility and frontend exclusion
────────────────────────────────

Entities are backend/storage-only by default.

Emit:

```yaml
visibility:
  - backend
  - storage
```

Rules:

1. Frontend generators must ignore entity metadata by default.
2. Entity metadata should not create frontend DTOs.
3. Entity metadata should not be emitted as normal OpenAPI component schemas beyond the source schemas already used.
4. x-codegen carries entity metadata for backend/storage templates only.

────────────────────────────────
15. Tests
────────────────────────────────

Add tests for:

Shared/base entities:

1. `v1.defineBaseEntities(...)` exists.
2. Abstract base entity requires schema or typed field source.
3. Abstract base has no store.
4. Abstract base emits `kind: abstract`.
5. Concrete shared entity emits `kind: entity`.
6. Concrete shared entity requires store.

Resource entities:
7. `resource.defineEntities(...)` exists.
8. Entity refs expose `.ref.<EntityKey>`.
9. Entity owner resource metadata is emitted.
10. Entity schema ref is emitted.
11. Entity store is emitted.
12. Entity visibility is backend/storage.

Inheritance:
13. `.extends(...)` accepts base entity refs.
14. Multiple bases merge field metadata in order.
15. Child field metadata overrides inherited metadata.
16. Store names do not inherit.
17. Relations do not inherit.

Fields:
18. Field override callback is typed from schema fields.
19. Invalid field override fails TypeScript if possible or compiler validation.
20. Field `.index()` emits.
21. Field `.unique()` emits.
22. Field `.role(...)` emits.
23. Field `.generated(...)` emits.

Backend fields:
24. `.backend(...)` works.
25. Backend fields emit under entity metadata.
26. Backend fields are available to field overrides.
27. Backend fields are available to constraints.
28. Backend fields do not emit as frontend/public API fields.

Relations:
29. `defineEntityRelations(...)` exists.
30. Relations use external entity refs only.
31. `local(...)` validates source field exists.
32. `foreign(...)` validates target field exists.
33. Cardinality emits.
34. Target owner/key emits.

Constraints:
35. Composite index emits.
36. Composite unique emits.
37. Named check emits.
38. Constraint names are required.
39. Constraint names must be unique per entity.
40. Invalid constraint fields fail.
41. Predicate vocabulary serializes correctly.
42. Field references serialize as `{ $field: 'fieldName' }`.
43. No raw SQL strings are required or emitted.

Neutrality:
44. Generated metadata contains no ORM-specific words.
45. Generated metadata contains no SQL-specific expressions.
46. Generated metadata contains no frontend DTO leakage.

Docs/examples:
47. README includes abstract base example.
48. README includes resource entity example.
49. README includes relation example.
50. README includes constraint example.

────────────────────────────────
16. Verification
────────────────────────────────

Run:

```bash
pnpm typecheck
pnpm exec tsx src/__tests__/access-metadata.ts
pnpm exec tsx src/__tests__/codegen-ui.ts
pnpm build
pnpm pack:dry
```

Also generate and inspect OpenAPI.

Confirm:

1. `x-codegen.baseEntities` exists.
2. `x-codegen.entities` exists.
3. Abstract bases do not have stores.
4. Concrete entities have stores.
5. Entities have backend/storage visibility.
6. Entity refs are stable.
7. Relations use external refs.
8. Backend fields emit only under entity metadata.
9. Constraints emit neutral predicate data.
10. No ORM/database/framework-specific terms appear.
11. Existing route/access/source/tag/runtime metadata still works.
