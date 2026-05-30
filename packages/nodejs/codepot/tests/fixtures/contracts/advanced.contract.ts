import { access, defineCodepotConfig, defineVersionContract, field, persistence, property, query } from '@/index';

const v1 = defineVersionContract({
  key: 'advanced_demo_api',
  version: 1,
  info: {
    title: 'Advanced Demo API',
    version: '1.0.0',
  },
  urls: [
    {
      env: 'local',
      uri: 'http://localhost:3000',
      description: 'Local development server',
    },
    {
      env: 'production',
      uri: 'https://api.example.com',
      description: 'Production API',
    },
  ],
});

// ============================================================================
// PROPERTIES
// ============================================================================

const props = v1.defineProperties();

const shared = props.shared({
  id: property.uuid().build(),
  slug: property.string().minLength(2).maxLength(80).build(),
  email: property.email().build(),
  displayName: property.string().minLength(2).maxLength(120).build(),
  title: property.string().minLength(2).maxLength(160).build(),
  description: property.string().maxLength(1000).build(),
  moneyAmount: property.number().min(0).build(),
  isoCurrency: property.string().minLength(3).maxLength(3).build(),
  createdAt: property.dateTime().build(),
  updatedAt: property.dateTime().build(),
  deletedAt: property.dateTime().build(),
});

const reusable = props.forRef({
  auditStamp: property
    .composite({
      createdAt: shared.ref.createdAt as any,
      updatedAt: shared.ref.updatedAt as any,
    })
    .build(),

  money: property
    .composite({
      amount: shared.ref.moneyAmount as any,
      currency: shared.ref.isoCurrency as any,
    })
    .build(),
});

const enums = props.shared({
  UserRole: property
    .enum({
      admin: { value: 'admin', label: 'Admin' },
      manager: { value: 'manager', label: 'Manager' },
      member: { value: 'member', label: 'Member' },
    })
    .build(),

  TicketStatus: property
    .enum({
      draft: { value: 'draft', label: 'Draft' },
      published: { value: 'published', label: 'Published' },
      cancelled: { value: 'cancelled', label: 'Cancelled' },
    })
    .build(),

  OrderStatus: property
    .enum({
      pending: { value: 'pending', label: 'Pending' },
      paid: { value: 'paid', label: 'Paid' },
      refunded: { value: 'refunded', label: 'Refunded' },
    })
    .build(),
});

// ============================================================================
// ENTITIES
// ============================================================================

const baseEntity = props.entity('BaseEntity', {
  id: field.ref(shared.ref.id, {
    required: true,
    query: query.filter().sort().select().done(),
    persistence: persistence.stored().generated().immutable().done(),
  }),

  createdAt: field.ref(shared.ref.createdAt, {
    required: true,
    query: query.filter().sort().done(),
    persistence: persistence.stored().immutable().done(),
  }),

  updatedAt: field.ref(shared.ref.updatedAt, {
    required: true,
    persistence: persistence.stored().done(),
  }),

  deletedAt: field.ref(shared.ref.deletedAt.nullable() as any, {
    required: false,
    query: query.filter().done(),
    access: access.internal().done(),
  }),
});

const user = props.entity(
  'User',
  {
    email: field.ref(shared.ref.email, {
      required: true,
      query: query.filter().select(false).done(),
      access: access.public().sensitive().done(),
    }),

    name: field.ref(shared.ref.displayName as any, {
      required: true,
      query: query.filter().sort().done(),
      access: access.public().done(),
    }),

    roles: field.ref(enums.ref.UserRole.array({ uniqueItems: true }) as any, {
      required: true,
      query: query.filter().done(),
      access: access.public().done(),
    }),
  },
  {
    extends: baseEntity.ref.models.read as any,
    tags: ['identity', 'auth'],
    description: 'Application user',
  },
);

const event = props.entity(
  'Event',
  {
    title: field.ref(shared.ref.title as any, {
      required: true,
      query: query.filter().sort().select().done(),
      access: access.public().done(),
    }),

    slug: field.ref(shared.ref.slug as any, {
      required: true,
      query: query.filter().sort().done(),
      access: access.public().done(),
    }),

    description: field.ref(shared.ref.description.nullable() as any, {
      required: false,
      access: access.public().done(),
    }),

    status: field.ref(enums.ref.TicketStatus as any, {
      required: true,
      query: query.filter().sort().done(),
      access: access.public().done(),
    }),

    organiser: field.ref(user.ref.models.read as any, {
      required: true,
      access: access.public().done(),
    }),

    audit: field.ref(reusable.ref.auditStamp as any, {
      required: true,
      access: access.internal().done(),
    }),
  },
  {
    extends: baseEntity.ref.models.read as any,
    tags: ['events'],
    description: 'Ticketed event',
  },
);

const ticket = props.entity(
  'Ticket',
  {
    event: field.ref(event.ref.models.read as any, {
      required: true,
      query: query.filter().done(),
    }),

    name: field.ref(shared.ref.title as any, {
      required: true,
      access: access.public().done(),
    }),

    price: field.ref(reusable.ref.money as any, {
      required: true,
      access: access.public().done(),
    }),

    status: field.ref(enums.ref.TicketStatus as any, {
      required: true,
      query: query.filter().sort().done(),
    }),
  },
  {
    extends: baseEntity.ref.models.read as any,
    tags: ['tickets'],
  },
);

const order = props.entity(
  'Order',
  {
    buyer: field.ref(user.ref.models.read as any, {
      required: true,
      query: query.filter().done(),
    }),

    event: field.ref(event.ref.models.read as any, {
      required: true,
      query: query.filter().done(),
    }),

    tickets: field.ref(ticket.ref.models.read.array({ minItems: 1 }) as any, {
      required: true,
    }),

    total: field.ref(reusable.ref.money as any, {
      required: true,
    }),

    status: field.ref(enums.ref.OrderStatus as any, {
      required: true,
      query: query.filter().sort().done(),
    }),
  },
  {
    extends: baseEntity.ref.models.read as any,
    tags: ['orders'],
  },
);

// ============================================================================
// DTOS / PARAMS
// ============================================================================

const schemas = v1.defineDtoSchemas();

const dtos = schemas.define({
  ErrorResponse: {
    fields: {
      message: shared.ref.description as any,
      code: shared.ref.slug as any,
    },
  },

  CreateEventBody: {
    fields: {
      title: event.ref.fields.title as any,
      description: event.ref.fields.description.optional() as any,
      status: event.ref.fields.status as any,
    },
  },

  PatchEventBody: {
    extends: event.ref.models.patch.extendWith({
      reason: shared.ref.description.optional() as any,
    }) as any,
    fields: {
      title: event.ref.fields.title.optional() as any,
      description: event.ref.fields.description.optional() as any,
      status: event.ref.fields.status.optional() as any,
    },
  },

  CreateOrderBody: {
    fields: {
      event: event.ref.models.read as any,
      tickets: ticket.ref.models.read.array({ minItems: 1 }) as any,
    },
  },

  OrderSummaryResponse: {
    extends: order.ref.models.read.extendWith({
      receiptUrl: shared.ref.slug.optional() as any,
    }) as any,
    fields: {
      order: order.ref.models.read as any,
    },
  },
});

const params = schemas.params({
  IdParams: {
    id: shared.ref.id,
  } as any,

  SlugParams: {
    slug: shared.ref.slug,
  } as any,
});

// ============================================================================
// TRANSPORT
// ============================================================================

const transport = v1.defineTransport();

const contentTypes = transport.defineContentTypes({
  json: transport.contentType.json(),
  form: transport.contentType.form(),
  multipart: transport.contentType.multipart(),
});

const requests = transport.defineRequests({
  CreateEventRequest: transport.request.json(dtos.ref.CreateEventBody),
  PatchEventRequest: transport.request.json(dtos.ref.PatchEventBody),
  CreateOrderRequest: transport.request.json(dtos.ref.CreateOrderBody),
});

const responses = transport.defineResponses({
  BadRequest: transport.response.json(400, dtos.ref.ErrorResponse),
  Unauthorized: transport.response.json(401, dtos.ref.ErrorResponse),
  Forbidden: transport.response.json(403, dtos.ref.ErrorResponse),
  NotFound: transport.response.json(404, dtos.ref.ErrorResponse),

  EventResponse: transport.response.json(200, event.ref.models.read),
  EventListResponse: transport.response.json(200, event.ref.models.read.array()),
  OrderResponse: transport.response.json(200, dtos.ref.OrderSummaryResponse),
});

transport.setDefaults({
  requestContentType: contentTypes.ref.json,
  responseContentType: contentTypes.ref.json,
  responses: {
    400: responses.ref.BadRequest,
    401: responses.ref.Unauthorized,
    403: responses.ref.Forbidden,
    404: responses.ref.NotFound,
  },
});

// ============================================================================
// SECURITY
// ============================================================================

const security = v1.defineSecurity();

const schemes = security.defineSchemes({
  bearer: security.scheme.bearerJwt(),
  apiKey: security.scheme.apiKeyHeader('x-api-key'),
});

const auth = security.defineAuth({
  jwt: security.auth.any([security.auth.scheme(schemes.ref.bearer)]),

  apiKey: security.auth.any([security.auth.scheme(schemes.ref.apiKey)]),
});

const roleSources = security.defineRoleSources({
  userRoles: security.roleSource.entityField(user.ref.fields.roles, enums.ref.UserRole as any),
});

const roleSets = security.defineRoleSets({
  admins: security.roleSet.values(roleSources.ref.userRoles, ['admin']),
  managers: security.roleSet.values(roleSources.ref.userRoles, ['manager']),
  adminsOrManagers: security.roleSet.values(roleSources.ref.userRoles, ['admin', 'manager']),
});

// Contexts and guards not yet implemented in API
// const contexts = security.defineContexts({
//   tenantMember: security.context.header('x-tenant-id') as any,
// });

// const guards = security.defineGuards({
//   tenantMemberGuard: security.guard.context(contexts.ref.tenantMember) as any,
// });

security.setDefaults(
  security.route.protected({
    auth: auth.ref.jwt,
    // guards: [guards.ref.tenantMemberGuard],
  }),
);

// ============================================================================
// RESOURCES
// ============================================================================

const users = v1.defineResource({
  key: 'users',
  folders: ['platform', 'identity'],
  security: security.route.protected({
    auth: auth.ref.jwt,
    roleSets: [roleSets.ref.admins],
  }),
});

users.defineRoutes().define((route) => ({
  listUsers: route
    .get('/')
    .security(security.route.roles([roleSets.ref.admins]))
    .responses({
      200: route.response.json(user.ref.models.read.array()),
      401: responses.ref.Unauthorized,
      403: responses.ref.Forbidden,
    }),

  getUser: route
    .get('/:id')
    .params(params.ref.IdParams)
    .responses({
      200: route.response.json(user.ref.models.read),
      404: responses.ref.NotFound,
    }),
}));

const events = v1.defineResource({
  key: 'events',
  folders: ['platform', 'events'],
  security: security.route.protected({
    auth: auth.ref.jwt,
    roleSets: [roleSets.ref.adminsOrManagers],
  }),
});

events.defineRoutes().define((route) => ({
  listEvents: route.get('/').query(event.ref.models.query).responses({
    200: responses.ref.EventListResponse,
    401: responses.ref.Unauthorized,
  }),

  getEvent: route.get('/:slug').params(params.ref.SlugParams).responses({
    200: responses.ref.EventResponse,
    404: responses.ref.NotFound,
  }),

  createEvent: route.post('/').body(requests.ref.CreateEventRequest).responses({
    200: responses.ref.EventResponse,
    400: responses.ref.BadRequest,
    403: responses.ref.Forbidden,
  }),

  patchEvent: route.patch('/:id').params(params.ref.IdParams).body(requests.ref.PatchEventRequest).responses({
    200: responses.ref.EventResponse,
    400: responses.ref.BadRequest,
    404: responses.ref.NotFound,
  }),
}));

const orders = v1.defineResource({
  key: 'orders',
  folders: ['platform', 'orders'],
  security: security.route.protected({
    auth: auth.ref.jwt,
  }),
});

orders.defineRoutes().define((route) => ({
  createOrder: route
    .post('/')
    .security(security.route.protected({ auth: auth.ref.jwt }))
    .body(requests.ref.CreateOrderRequest)
    .responses({
      200: responses.ref.OrderResponse,
      400: responses.ref.BadRequest,
      401: responses.ref.Unauthorized,
    }),

  getOrder: route.get('/:id').params(params.ref.IdParams).responses({
    200: responses.ref.OrderResponse,
    404: responses.ref.NotFound,
  }),

  publicOrderReceipt: route.get('/public/:id').security(security.route.public()).params(params.ref.IdParams).responses({
    200: responses.ref.OrderResponse,
    404: responses.ref.NotFound,
  }),
}));

export const advancedVersion = v1;

export const advancedConfig = defineCodepotConfig({
  contracts: [v1],
  output: {
    folder: 'tests/generated/debug',
    baseName: 'advanced',
    formats: ['json', 'yaml'],
  },
});

export default advancedConfig;
