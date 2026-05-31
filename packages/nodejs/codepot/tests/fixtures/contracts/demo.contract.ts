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
  moneyAmount: property.number().min(0),
  currencyCode: property.string().minLength(3).maxLength(3),
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
    amount: primitives.ref.moneyAmount,
    currency: primitives.ref.currencyCode,
  }),

  inlineMoney: property.composite({
    amount: property.number().min(0),
    currency: property.string().minLength(3).maxLength(3),
  }),
});

// ============================================================================
// BASE ENTITY
// ============================================================================

export const baseEntity = schemas.entity(
  'BaseEntity',
  {
    id: field(primitives.ref.id)
      .required()
      .capability((c) => c.filter().sort().select())
      .lifecycle((l) => l.generated().immutable())
      .persistence((p) => p.stored()),

    createdAt: field(primitives.ref.dateTime)
      .required()
      .capability((c) => c.filter().sort())
      .lifecycle((l) => l.immutable())
      .persistence((p) => p.stored()),

    updatedAt: field(primitives.ref.dateTime)
      .required()
      .persistence((p) => p.stored()),
  },
  { abstract: true },
);

// ============================================================================
// ENTITIES
// ============================================================================

export const user = schemas
  .entity(
    'User',
    {
      name: field(primitives.ref.displayName)
        .required()
        .capability((c) => c.filter().sort().select())
        .visibility((v) => v.public()),

      email: field(primitives.ref.email)
        .required()
        .capability((c) => c.filter().select(false))
        .visibility((v) => v.public().sensitive()),

      bio: field(primitives.ref.text)
        .optional()
        .nullable()
        .visibility((v) => v.public()),

      nickname: field(property.string().minLength(2).maxLength(40))
        .optional()
        .visibility((v) => v.public()),

      role: field(enums.ref.UserRole)
        .required()
        .capability((c) => c.filter().sort())
        .visibility((v) => v.public()),

      roles: field(enums.ref.UserRole).array().required(),

      status: field(enums.ref.UserStatus)
        .required()
        .capability((c) => c.filter().sort())
        .visibility((v) => v.internal()),

      billingLimit: field(composites.ref.money).optional(),
      inlineBillingLimit: field(composites.ref.inlineMoney).optional(),
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
      .visibility((v) => v.internal()),

    displayName: field(primitives.ref.displayName)
      .required()
      .visibility((v) => v.public()),

    bio: field(primitives.ref.bio)
      .optional()
      .nullable()
      .visibility((v) => v.public()),
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
      .capability((c) => c.filter().sort().select()),

    body: field(primitives.ref.bio)
      .required()
      .visibility((v) => v.public()),
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
      .capability((c) => c.filter().sort()),

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
