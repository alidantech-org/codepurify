import {
  access,
  defineCodepotConfig,
  defineVersionContract,
  field,
  persistence,
  property,
  query,
} from '@/index';

const v1 = defineVersionContract({
  key: 'demo_api',
  version: 1,
  info: {
    title: 'Demo API',
    version: '1.0.0',
  },
});

const props = v1.defineProperties();

const shared = props.shared({
  id: property.uuid().build(),
  displayName: property.string().minLength(2).maxLength(80).build(),
  email: property.email().build(),
});

const enums = props.shared({
  UserRole: property
    .enum({
      admin: { value: 'admin', label: 'Admin' },
      member: { value: 'member', label: 'Member' },
    })
    .build(),
});

const user = props.entity('User', {
  id: field.ref(shared.ref.id, {
    required: true,
    query: query.filter().sort().select().done(),
    persistence: persistence.stored().generated().immutable().done(),
  }),

  name: field.ref(shared.ref.displayName, {
    required: true,
    query: query.filter().sort().done(),
    access: access.public().done(),
  }),

  email: field.ref(shared.ref.email, {
    required: true,
    query: query.filter().select(false).done(),
    access: access.public().sensitive().done(),
  }),

  role: field.ref(enums.ref.UserRole, {
    required: true,
    query: query.filter().sort().done(),
    access: access.public().done(),
  }),
});

const dtos = v1.defineDtoSchemas();

const sharedDtos = dtos.define({
  ErrorResponse: {
    fields: {
      message: user.ref.fields.name,
    },
  },
});

const security = v1.defineSecurity();

const schemes = security.defineSchemes({
  bearer: security.scheme.bearerJwt(),
});

const auth = security.defineAuth({
  jwt: security.auth.any([
    security.auth.scheme(schemes.ref.bearer),
  ]),
});

const roleSources = security.defineRoleSources({
  userRole: security.roleSource.entityField(
    user.ref.fields.role,
    enums.ref.UserRole as any,
  ),
});

const roleSets = security.defineRoleSets({
  admins: security.roleSet.values(roleSources.ref.userRole, ['admin']),
});

const transport = v1.defineTransport();

const contentTypes = transport.defineContentTypes({
  json: transport.contentType.json(),
});

const responses = transport.defineResponses({
  BadRequest: transport.response.json(400, sharedDtos.ref.ErrorResponse),
  Unauthorized: transport.response.json(401, sharedDtos.ref.ErrorResponse),
  NotFound: transport.response.json(404, sharedDtos.ref.ErrorResponse),
});

transport.setDefaults({
  requestContentType: contentTypes.ref.json,
  responseContentType: contentTypes.ref.json,
  responses: {
    400: responses.ref.BadRequest,
    401: responses.ref.Unauthorized,
    404: responses.ref.NotFound,
  },
});

const users = v1.defineResource({
  key: 'users',
  folders: ['platform', 'auth'],
  security: security.route.protected({
    auth: auth.ref.jwt,
  }),
});

users.defineRoutes().define((route) => ({
  listUsers: route
    .get('/')
    .security(
      security.route.roles([roleSets.ref.admins], {
        auth: auth.ref.jwt,
      }),
    )
    .responses({
      200: route.response.json(user.ref.models.read.array()),
      400: responses.ref.BadRequest,
      401: responses.ref.Unauthorized,
    }),

  getUser: route
    .get('/:id')
    .responses({
      200: route.response.json(user.ref.models.read),
      401: responses.ref.Unauthorized,
      404: responses.ref.NotFound,
    }),

  publicProfile: route
    .get('/public/:id')
    .security(security.route.public())
    .responses({
      200: route.response.json(user.ref.models.read),
      404: responses.ref.NotFound,
    }),
}));

export const demoVersion = v1;

export const demoConfig = defineCodepotConfig({
  contracts: [v1],
  output: {
    folder: 'tests/generated/debug',
    baseName: 'demo',
    formats: ['json', 'yaml'],
  },
});

export default demoConfig;
