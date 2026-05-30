import { defineCodepotConfig, defineVersionContract, property, field, query, access, persistence, security } from '@/index';

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

const user = props.entity('User', {
  id: field.ref(shared.ref.id, {
    required: true,
    query: query.filter().sort().select().done(),
    persistence: persistence.stored().generated().immutable().done(),
  }),

  name: field.ref(shared.ref.displayName, {
    required: true,
    query: query.filter().sort().done(),
  }),

  email: field.ref(shared.ref.email, {
    required: true,
    access: access.public().sensitive().done(),
  }),
});

const dto = v1.defineDtoSchemas();

const sharedDtos = dto.define({
  ErrorResponse: {
    fields: {
      message: user.ref.fields.name,
    },
  },
});

const sec = v1.defineSecurity();

const schemes = sec.defineSchemes({
  bearer: sec.scheme.bearerJwt(),
});

const auth = sec.defineAuth({
  jwt: sec.auth.any([sec.auth.scheme(schemes.ref.bearer)]),
});

const transport = v1.defineTransport();

const contentTypes = transport.defineContentTypes({
  json: transport.contentType.json(),
});

const responses = transport.defineResponses({
  BadRequest: transport.response.json(400, sharedDtos.ref.ErrorResponse),
  Unauthorized: transport.response.json(401, sharedDtos.ref.ErrorResponse),
});

transport.setDefaults({
  requestContentType: contentTypes.ref.json,
  responseContentType: contentTypes.ref.json,
  responses: {
    400: responses.ref.BadRequest,
    401: responses.ref.Unauthorized,
  },
});

const users = v1.defineResource({
  key: 'users',
  folders: ['platform', 'auth'],
  security: sec.route.protected({
    auth: auth.ref.jwt,
  }),
});

users.defineRoutes().define((route) => ({
  listUsers: route.get('/').responses({
    200: route.response.json(user.ref.models.read.array()),
    400: responses.ref.BadRequest,
  }),

  getUser: route.get('/:id').responses({
    200: route.response.json(user.ref.models.read),
    401: responses.ref.Unauthorized,
  }),
}));

export const demoVersion = v1;

export const demoConfig = defineCodepotConfig({
  contracts: [v1],
  output: {
    folder: 'tests/smoke/generated',
    baseName: 'demo',
    formats: ['json', 'yaml'],
  },
});

export default demoConfig;
