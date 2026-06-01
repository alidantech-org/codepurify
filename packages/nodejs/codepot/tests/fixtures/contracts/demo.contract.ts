import { content, defineCodepotConfig, defineVersionContract, error, field, property } from '@/index';

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
  title: property.string().minLength(2).maxLength(120),
  email: property.email(),
  bio: property.string().maxLength(500),
  message: property.string().maxLength(1000),
  fileName: property.string().minLength(1).maxLength(180),

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
    owner: { value: 'owner', label: 'Owner' },
    admin: { value: 'admin', label: 'Admin' },
    member: { value: 'member', label: 'Member' },
  }),

  UserStatus: property.enum({
    active: { value: 'active', label: 'Active' },
    suspended: { value: 'suspended', label: 'Suspended' },
  }),

  PostStatus: property.enum({
    draft: { value: 'draft', label: 'Draft' },
    published: { value: 'published', label: 'Published' },
    archived: { value: 'archived', label: 'Archived' },
  }),
});

// ============================================================================
// COMPOSITES
// ============================================================================

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

    deletedAt: field(primitives.ref.dateTime)
      .optional()
      .nullable()
      .capability((c) => c.filter())
      .lifecycle((l) => l.immutable())
      .persistence((p) => p.stored()),
  },
  { abstract: true },
);

// ============================================================================
// ENTITIES
// ============================================================================

export const tenant = schemas
  .entity(
    'Tenant',
    {
      ownerId: field(primitives.ref.id).capability((c) => c.filter()),

      name: field(primitives.ref.displayName)
        .required()
        .capability((c) => c.filter().sort().select())
        .visibility((v) => v.public()),
    },
    {
      extends: baseEntity,
      tags: ['tenant'],
    },
  )
  .models({
    public: (m) => m.pick('id', 'name'),
    create: (m) => m.omit('id', 'createdAt', 'updatedAt', 'deletedAt'),
    patch: (m) => m.partial().omit('id', 'createdAt', 'updatedAt', 'deletedAt'),
  });

export const user = schemas
  .entity(
    'User',
    {
      tenant: field
        .relation()
        .required()
        .capability((c) => c.filter().select())
        .visibility((v) => v.internal()),

      profile: field
        .relation()
        .optional()
        .visibility((v) => v.internal()),

      posts: field
        .relation()
        .array()
        .visibility((v) => v.public())
        .capability((c) => c.select()),

      name: field(primitives.ref.displayName)
        .required()
        .capability((c) => c.filter().sort().select())
        .visibility((v) => v.public()),

      email: field(primitives.ref.email)
        .required()
        .capability((c) => c.filter().select(false))
        .visibility((v) => v.public().sensitive()),

      bio: field(primitives.ref.bio)
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
    create: (m) => m.partial().omit('id', 'createdAt', 'updatedAt', 'deletedAt', 'profile', 'posts'),
    patch: (m) => m.partial().omit('id', 'createdAt', 'updatedAt', 'deletedAt', 'profile', 'posts'),
    public: (m) => m.pick('id', 'name', 'bio', 'role'),
  });

export const profile = schemas
  .entity(
    'Profile',
    {
      user: field
        .relation()
        .required()
        .capability((c) => c.filter().select())
        .visibility((v) => v.internal()),

      tenantSnapshot: field
        .relation()
        .optional()
        .visibility((v) => v.internal()),

      displayName: field(primitives.ref.displayName)
        .required()
        .visibility((v) => v.public()),

      bio: field(primitives.ref.bio)
        .optional()
        .nullable()
        .visibility((v) => v.public()),
    },
    { extends: baseEntity },
  )
  .models({
    public: (m) => m.pick('id', 'displayName', 'bio'),
    create: (m) => m.omit('id', 'createdAt', 'updatedAt', 'deletedAt', 'user', 'tenantSnapshot'),
    patch: (m) => m.partial().omit('id', 'createdAt', 'updatedAt', 'deletedAt'),
  });

export const post = schemas
  .entity(
    'Post',
    {
      author: field
        .relation()
        .required()
        .capability((c) => c.filter().select())
        .visibility((v) => v.internal()),

      tags: field
        .relation()
        .array()
        .visibility((v) => v.public())
        .capability((c) => c.select()),

      relatedProfiles: field
        .relation()
        .array()
        .visibility((v) => v.internal())
        .capability((c) => c.select()),

      title: field(primitives.ref.title)
        .required()
        .capability((c) => c.filter().sort().select())
        .visibility((v) => v.public()),

      body: field(primitives.ref.bio)
        .required()
        .visibility((v) => v.public()),

      status: field(enums.ref.PostStatus)
        .required()
        .capability((c) => c.filter().sort())
        .visibility((v) => v.public()),
    },
    { extends: baseEntity },
  )
  .models({
    read: (m) => m.relations('expand'),
    public: (m) => m.pick('id', 'author', 'title', 'body', 'status', 'tags'),
    create: (m) => m.omit('id', 'createdAt', 'updatedAt', 'deletedAt', 'author', 'tags', 'relatedProfiles'),
    patch: (m) => m.partial().omit('id', 'createdAt', 'updatedAt', 'deletedAt', 'author', 'tags', 'relatedProfiles'),
  });

export const tag = schemas
  .entity(
    'Tag',
    {
      posts: field
        .relation()
        .array()
        .visibility((v) => v.public())
        .capability((c) => c.select()),

      name: field(primitives.ref.displayName)
        .required()
        .capability((c) => c.filter().sort()),
    },
    { extends: baseEntity },
  )
  .models({
    public: (m) => m.pick('id', 'name'),
    option: (m) => m.pick('id', 'name'),
  });

export const postTag = schemas
  .entity(
    'PostTag',
    {
      post: field
        .relation()
        .required()
        .capability((c) => c.filter())
        .visibility((v) => v.internal()),

      tag: field
        .relation()
        .required()
        .capability((c) => c.filter())
        .visibility((v) => v.internal()),
    },
    {
      extends: baseEntity,
      tags: ['join', 'post_tag'],
    },
  )
  .models({
    read: (m) => m.relations('expand'),
    create: (m) => m.omit('id', 'createdAt', 'updatedAt', 'deletedAt'),
  });

// ============================================================================
// RELATION LINKING
// ============================================================================

user.relations({
  tenant: (r) => r.belongsTo(tenant),

  profile: (r) => r.hasOne(profile).inverse(profile.ref.fields.user),

  posts: (r) => r.hasMany(post).inverse(post.ref.fields.author),
});

profile.relations({
  user: (r) => r.belongsTo(user).inverse(user.ref.fields.profile),

  tenantSnapshot: (r) => r.hasOne(tenant),
});

post.relations({
  author: (r) => r.belongsTo(user).inverse(user.ref.fields.posts),

  tags: (r) =>
    r
      .manyToMany(tag)
      .through(postTag, {
        from: postTag.ref.fields.post,
        to: postTag.ref.fields.tag,
      })
      .inverse(tag.ref.fields.posts),

  relatedProfiles: (r) => r.hasMany(profile),
});

tag.relations({
  posts: (r) =>
    r
      .manyToMany(post)
      .through(postTag, {
        from: postTag.ref.fields.tag,
        to: postTag.ref.fields.post,
      })
      .inverse(post.ref.fields.tags),
});

postTag.relations({
  post: (r) => r.belongsTo(post),

  tag: (r) => r.belongsTo(tag),
});

// ============================================================================
// DTOS
// ============================================================================

const commonDtos = schemas.dtos({
  ErrorResponse: {
    message: primitives.ref.message.required(),
    code: primitives.ref.text.optional(),
  },

  ValidationErrorResponse: {
    message: primitives.ref.message.required(),
    field: primitives.ref.text.optional(),
  },

  ApiResponse: {
    success: primitives.ref.boolean.required(),
    message: primitives.ref.message.optional(),
  },

  PaginatedResponse: {
    page: primitives.ref.integer.required(),
    limit: primitives.ref.integer.required(),
    total: primitives.ref.integer.required(),
  },
});

export const dtos = schemas.dtos({
  // Mode 1: direct model-backed DTOs
  UserPublic: user.ref.models.public,
  UserPatchBody: user.ref.models.patch,
  PostPublic: post.ref.models.public,

  // Mode 2: field-map DTOs
  ListUsersQuery: {
    search: primitives.ref.text.optional(),
    role: user.ref.fields.role.optional(),
    status: user.ref.fields.status.optional(),
    page: primitives.ref.integer.optional(),
    limit: primitives.ref.integer.optional(),
  },

  ListPostsQuery: {
    search: primitives.ref.text.optional(),
    status: post.ref.fields.status.optional(),
    author: post.ref.fields.author.optional(),
    page: primitives.ref.integer.optional(),
    limit: primitives.ref.integer.optional(),
  },

  CreateUserBody: {
    name: user.ref.fields.name.required(),
    email: user.ref.fields.email.required(),
    role: user.ref.fields.role.required(),
    tenant: user.ref.fields.tenant.required(),
  },

  CreatePostBody: {
    title: post.ref.fields.title.required(),
    body: post.ref.fields.body.required(),
    status: post.ref.fields.status.optional(),
  },

  UpdateProfileBody: {
    name: user.ref.fields.name.optional(),
    bio: user.ref.fields.bio.optional().nullable(),
  },

  UploadAvatarBody: {
    file: primitives.ref.fileName.required(),
  },

  FeedResponse: {
    title: primitives.ref.title.required(),
    body: primitives.ref.bio.required(),
  },

  ExportUsersResponse: {
    fileName: primitives.ref.fileName.required(),
  },

  // Mode 3: extendWith composition
  UploadAvatarResponse: commonDtos.ref.ApiResponse.extendWith({
    user: user.ref.models.public.required(),
  }),

  UserResponse: commonDtos.ref.ApiResponse.extendWith({
    user: user.ref.models.public.required(),
  }),

  UserListResponse: commonDtos.ref.PaginatedResponse.extendWith({
    items: user.ref.models.public.array().required(),
  }),

  PostResponse: commonDtos.ref.ApiResponse.extendWith({
    post: post.ref.models.public.required(),
  }),

  PostListResponse: commonDtos.ref.PaginatedResponse.extendWith({
    items: post.ref.models.public.array().required(),
  }),

  // Entity field inheritance/override proofs
  UserBioInheritsEntityOptions: {
    bio: user.ref.fields.bio,
  },

  UserBioRequiredButStillNullable: {
    bio: user.ref.fields.bio.required(),
  },

  UserBioRequiredNonNullable: {
    bio: user.ref.fields.bio.required().nonNullable(),
  },

  UserEmailOptionalOverride: {
    email: user.ref.fields.email.optional(),
  },

  UserRolesInheritArray: {
    roles: user.ref.fields.roles,
  },

  UserPrimaryRoleSingle: {
    role: user.ref.fields.roles.single(),
  },

  UserRoleArrayOverride: {
    roles: user.ref.fields.role.array(),
  },

  UserPrimaryRoleStrict: {
    role: user.ref.fields.roles.required().nonNullable().single(),
  },
});

// ============================================================================
// PARAMS
// ============================================================================

export const params = schemas.params({
  id: user.ref.fields.id,
  tenantId: tenant.ref.fields.id,
  postId: post.ref.fields.id,
});

// ============================================================================
// ERRORS
// ============================================================================

export const errors = v1.defineErrors({
  unauthorized: error(401, commonDtos.ref.ErrorResponse, {
    intent: 'unauthorized',
  }),

  forbidden: error(403, commonDtos.ref.ErrorResponse, {
    intent: 'forbidden',
  }),

  notFound: error(404, commonDtos.ref.ErrorResponse, {
    intent: 'not_found',
  }),

  validation: error(422, commonDtos.ref.ValidationErrorResponse, {
    intent: 'validation',
  }),

  xmlError: error(400, commonDtos.ref.ErrorResponse, content.xml()),
});

// ============================================================================
// SECURITY
// ============================================================================

const security = v1.defineSecurity();

const credentials = security.credentials({
  bearer: security.bearerHeader({
    valueType: primitives.ref.text,
  }),

  session: security.cookie('session_id', {
    format: 'session',
    valueType: primitives.ref.text,
  }),
});

const principals = security.principals({
  user: security.principal({
    id: user.ref.fields.id,
    roles: user.ref.fields.roles,
    status: user.ref.fields.status,
  }),

  tenant: security.principal({
    id: tenant.ref.fields.id,
    ownerId: tenant.ref.fields.ownerId,
  }),
});

const policies = security.policies({
  public: security.public(),

  authenticated: security.protected(),

  tenantMember: security.require({
    credential: credentials.ref.bearer,
    principals: {
      user: principals.ref.user,
      tenant: principals.ref.tenant,
    },
    roles: ['owner', 'admin', 'member'],
    intent: 'tenant_role',
  }),

  tenantAdmin: security.require({
    credential: credentials.ref.bearer,
    principals: {
      user: principals.ref.user,
      tenant: principals.ref.tenant,
    },
    roles: ['owner', 'admin'],
    permissions: ['users.read', 'users.write'],
    intent: 'tenant_role',
  }),
});

// ============================================================================
// RESOURCES + RESOURCE-SCOPED ERRORS + ROUTES
// ============================================================================

const users = v1.defineResource({
  key: 'users',
  folders: ['platform', 'auth'],
  security: security.protected(),
});

const userSchemas = users.defineSchemas();

const userParams = userSchemas.params({
  id: user.ref.fields.id,
});

const userErrors = users.defineErrors({
  emailTaken: error(409, commonDtos.ref.ErrorResponse, {
    intent: 'conflict',
    meta: { reason: 'email_taken' },
  }),
});

users.defineRoutes().define((route) => ({
  listUsers: route
    .get('/')
    .query(dtos.ref.ListUsersQuery)
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.unauthorized, errors.ref.forbidden)
    .output(dtos.ref.UserListResponse),

  getUser: route
    .get('/:id')
    .params(userParams.ref.id)
    .security(security.protected())
    .errors(errors.ref.unauthorized, errors.ref.notFound)
    .output(dtos.ref.UserResponse),

  createUser: route
    .post('/')
    .body(dtos.ref.CreateUserBody)
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.validation, userErrors.ref.emailTaken)
    .created(dtos.ref.UserResponse),

  updateProfile: route
    .patch('/:id/profile')
    .params(userParams.ref.id)
    .body(dtos.ref.UpdateProfileBody)
    .security(security.protected())
    .errors(errors.ref.validation, errors.ref.unauthorized, errors.ref.notFound)
    .output(dtos.ref.UserResponse),

  uploadAvatar: route
    .post('/:id/avatar')
    .params(userParams.ref.id)
    .body(dtos.ref.UploadAvatarBody, content.multipart())
    .security(security.protected())
    .errors(errors.ref.validation, errors.ref.unauthorized)
    .created(dtos.ref.UploadAvatarResponse),

  exportUsersCsv: route
    .get('/export.csv')
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.unauthorized, errors.ref.forbidden)
    .output(dtos.ref.ExportUsersResponse, content.csv()),

  feedXml: route
    .get('/feed.xml')
    .security(policies.ref.public)
    .errors(errors.ref.xmlError)
    .output(dtos.ref.FeedResponse, [content.json(), content.xml()]),

  deleteUser: route
    .delete('/:id')
    .params(userParams.ref.id)
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.unauthorized, errors.ref.notFound)
    .noContent(),

  legacyRawResponses: route.get('/legacy').responses({
    200: {
      status: 200,
      schema: dtos.ref.UserResponse,
      content: [content.json()],
    },
  }),
}));

const posts = v1.defineResource({
  key: 'posts',
  folders: ['content'],
  security: security.protected(),
});

const postSchemas = posts.defineSchemas();

const postParams = postSchemas.params({
  id: post.ref.fields.id,
});

posts.defineRoutes().define((route) => ({
  listPosts: route
    .get('/')
    .query(dtos.ref.ListPostsQuery)
    .security(policies.ref.authenticated)
    .errors(errors.ref.unauthorized)
    .output(dtos.ref.PostListResponse),

  getPost: route
    .get('/:id')
    .params(postParams.ref.id)
    .security(policies.ref.authenticated)
    .errors(errors.ref.unauthorized, errors.ref.notFound)
    .output(dtos.ref.PostResponse),

  createPost: route
    .post('/')
    .body(dtos.ref.CreatePostBody)
    .security(policies.ref.tenantMember)
    .errors(errors.ref.validation, errors.ref.unauthorized)
    .created(dtos.ref.PostResponse),

  deletePost: route
    .delete('/:id')
    .params(postParams.ref.id)
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.unauthorized, errors.ref.forbidden, errors.ref.notFound)
    .noContent(),
}));

const tenants = v1.defineResource({
  key: 'tenants',
  folders: ['platform', 'tenant'],
  security: policies.ref.tenantMember,
});

tenants.defineRoutes().define((route) => ({
  getTenant: route
    .get('/:tenantId')
    .params(params.ref.tenantId)
    .security(policies.ref.tenantMember)
    .errors(errors.ref.unauthorized, errors.ref.forbidden, errors.ref.notFound)
    .output(dtos.ref.UserResponse),

  updateTenant: route
    .patch('/:tenantId')
    .params(params.ref.tenantId)
    .body(dtos.ref.UpdateProfileBody)
    .security(policies.ref.tenantAdmin)
    .errors(errors.ref.validation, errors.ref.forbidden)
    .output(dtos.ref.UserResponse),
}));

// ============================================================================
// EXPORT
// ============================================================================

export const demoConfig = defineCodepotConfig({
  contracts: [v1],
  output: {
    folder: 'tests/generated/debug',
    baseName: 'demo',
    formats: ['json', 'yaml'],
  },
});

export default demoConfig;
