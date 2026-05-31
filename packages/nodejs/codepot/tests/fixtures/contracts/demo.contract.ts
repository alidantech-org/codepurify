import { defineCodepotConfig, defineVersionContract, field, property } from '@/index';

// ============================================================================
// VERSION DEFINITION
// ============================================================================

export const v1 = defineVersionContract({
  key: 'demo_api',
  version: 1,
  info: { title: 'Demo API', version: '1.0.0' },
});

export const properties = v1.defineProperties();
export const schemas = v1.defineSchemas();

// ============================================================================
// PRIMITIVES
// ============================================================================

const primitives = properties.primitives({
  id: property.uuid(),
  dateTime: property.dateTime(),
  displayName: property.string().minLength(2).maxLength(80),
  email: property.email(),
  bio: property.string().maxLength(500),
  integer: property.integer(),
  text: property.string(),
  boolean: property.boolean(),
});

// ============================================================================
// ENUMS
// ============================================================================

export const enums = properties.enums({
  UserRole: property.enum({
    admin: { value: 'admin', label: 'Admin' },
    member: { value: 'member', label: 'Member' },
  }),
  UserStatus: property.enum({
    active: { value: 'active', label: 'Active' },
    suspended: { value: 'suspended', label: 'Suspended' },
  }),
});

export const composites = properties.composites({
  money: property.composite({
    amount: property.number().min(0),
    currency: property.string().minLength(3).maxLength(3),
  }),
});

// ============================================================================
// BASE ENTITY
// ============================================================================

export const baseEntity = schemas.entity('BaseEntity', {
  id: field(primitives.ref.id)
    .required()
    .query((q) => q.filter().sort().select())
    .persistence((p) => p.stored().generated().immutable()),

  createdAt: field(primitives.ref.dateTime)
    .required()
    .query((q) => q.filter().sort())
    .persistence((p) => p.stored().immutable()),

  updatedAt: field(primitives.ref.dateTime)
    .required()
    .persistence((p) => p.stored()),
});

// ============================================================================
// ENTITIES
// ============================================================================

export const user = schemas
  .entity(
    'User',
    {
      name: field(primitives.ref.displayName)
        .required()
        .query((q) => q.filter().sort().select())
        .access((a) => a.public()),

      email: field(primitives.ref.email)
        .required()
        .query((q) => q.filter().select(false))
        .access((a) => a.public().sensitive()),

      bio: field(primitives.ref.text)
        .optional()
        .nullable()
        .access((a) => a.public()),

      role: field(enums.ref.UserRole)
        .required()
        .query((q) => q.filter().sort())
        .access((a) => a.public()),

      roles: field(enums.ref.UserRole).array().required(),

      status: field(enums.ref.UserStatus)
        .required()
        .query((q) => q.filter().sort())
        .access((a) => a.internal()),

      billingLimit: field(composites.ref.money).optional(),
    },
    {
      extends: baseEntity,
      tags: ['auth', 'identity'],
      description: 'Application user',
    },
  )
  .fieldSets({
    list_select: (s) => s.only('id', 'name', 'role'),
    list_sort: (s) => s.only('createdAt', 'role'),
    list_filter: (s) => s.only('id', 'role', 'status'),
    public_list_select: (s) => s.only('id', 'name'),
    admin_list_select: (s) => s.only('id', 'name', 'email', 'role', 'status'),
  })
  .models({
    read: (m) => m.relations('expand'),
    create: (m) => m.partial(),
    patch: (m) => m.partial(),
    public: (m) => m.pick('name', 'bio', 'id'),
  });

export const profile = schemas
  .entity('Profile', {
    user: field
      .belongsTo(user)
      .required()
      .access((a) => a.internal()),

    displayName: field(primitives.ref.displayName)
      .required()
      .access((a) => a.public()),

    bio: field(primitives.ref.bio)
      .optional()
      .nullable()
      .access((a) => a.public()),
  })
  .models({
    public: (m) => m.pick('displayName', 'bio'),
    create: (m) => m.omit('user'),
    patch: (m) => m.partial(),
  });

export const post = schemas
  .entity('Post', {
    author: field.belongsTo(user).required(),

    title: field(primitives.ref.displayName)
      .required()
      .query((q) => q.filter().sort().select()),

    body: field(primitives.ref.bio)
      .required()
      .access((a) => a.public()),
  })
  .models({
    read: (m) => m.relations('expand'),
    public: (m) => m.pick('author', 'title', 'body'),
    create: (m) => m.omit('author'),
    patch: (m) => m.partial().omit('author'),
  });

export const tag = schemas
  .entity('Tag', {
    name: field(primitives.ref.displayName)
      .required()
      .query((q) => q.filter().sort()),

    posts: field.manyToMany(post),
  })
  .models({
    public: (m) => m.pick('name'),
    option: (m) => m.pick('name'),
  });

// ============================================================================
// DTOS
// ============================================================================

const commonDtos = schemas.dtos({
  ErrorResponse: {
    message: primitives.ref.text.required(),
    code: primitives.ref.text.optional(),
  },

  ApiResponse: {
    success: primitives.ref.boolean.required(),
    message: primitives.ref.text.optional(),
  },

  PaginatedResponse: {
    page: primitives.ref.integer.required(),
    limit: primitives.ref.integer.required(),
    total: primitives.ref.integer.required(),
  },
});

export const dtos = schemas.dtos({
  // User DTOs - direct model assignment
  UserPublic: user.ref.models.public,

  UserPatchBody: user.ref.models.patch,

  // User DTOs - composition via extendWith
  UserResponse: commonDtos.ref.ApiResponse.extendWith({
    user: user.ref.models.public.required(),
  }),

  UserListResponse: commonDtos.ref.PaginatedResponse.extendWith({
    items: user.ref.models.public.array().required(),
  }),

  // User DTOs - flat field map
  UpdateProfileBody: {
    name: user.ref.fields.name.optional(),
    bio: user.ref.fields.bio.optional().nullable(),
  },

  // Proof DTOs - inheritance from entity field options
  // UserBioInheritsEntityOptions: bio inherits optional + nullable from User.bio
  UserBioInheritsEntityOptions: {
    bio: user.ref.fields.bio,
  },

  // UserBioRequiredButStillNullable: required overrides entity optional, nullable inherited
  UserBioRequiredButStillNullable: {
    bio: user.ref.fields.bio.required(),
  },

  // UserBioRequiredNonNullable: required + nonNullable override both
  UserBioRequiredNonNullable: {
    bio: user.ref.fields.bio.required().nonNullable(),
  },

  // UserEmailOptionalOverride: optional overrides entity required
  UserEmailOptionalOverride: {
    email: user.ref.fields.email.optional(),
  },

  // Proof DTOs - array/single inheritance from entity field options
  // UserRolesInheritArray: roles inherits array from entity
  UserRolesInheritArray: {
    roles: user.ref.fields.roles,
  },

  // UserPrimaryRoleSingle: array false override (single from array)
  UserPrimaryRoleSingle: {
    role: user.ref.fields.roles.single(),
  },

  // UserRoleArrayOverride: array true override (array from single)
  UserRoleArrayOverride: {
    roles: user.ref.fields.role.array(),
  },

  // UserPrimaryRoleStrict: required + nonNullable + single override all
  UserPrimaryRoleStrict: {
    role: user.ref.fields.roles.required().nonNullable().single(),
  },
});

// ============================================================================
// PARAMS
// ============================================================================

export const params = schemas.params({
  id: user.ref.fields.id,
});

// ============================================================================
// EXPORT
// ============================================================================

export const demoConfig = defineCodepotConfig({
  contracts: [v1],
  output: { folder: 'tests/generated/debug', baseName: 'demo', formats: ['json', 'yaml'] },
});

export default demoConfig;
