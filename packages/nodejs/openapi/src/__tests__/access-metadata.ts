import { strict as assert } from 'node:assert';
import { z } from 'zod';
import { CODEGEN_EXTENSION_KEY, compileOpenApi, defineVersionContract } from '../index.js';

const v1 = defineVersionContract({
  info: {
    title: 'Access metadata',
    version: 'v1',
  },
});

const sharedProps = v1.defineProperties('Shared', {
  uuid: z.string().uuid(),
  message: z.string(),
});

const auth = v1.defineResource({
  name: 'auth',
  route: '/auth',
  folders: ['_global'],
});

const authProps = auth.defineProperties('Auth', {
  systemRole: z.enum(['user', 'admin']),
  tenantRole: z.enum(['owner', 'admin', 'editor', 'viewer']),
});

const authSchemas = auth.defineSchemas({
  AuthUserContext: {
    userId: sharedProps.ref.uuid,
    systemRoles: authProps.ref.systemRole.array(),
  },

  AuthTenantContext: {
    userId: sharedProps.ref.uuid,
    tenantId: sharedProps.ref.uuid,
    systemRoles: authProps.ref.systemRole.array(),
    tenantRoles: authProps.ref.tenantRole.array(),
  },
});

const access = v1.defineAccess({
  public: {
    context: null,
  },

  authenticated: {
    context: authSchemas.ref.AuthUserContext,
  },

  tenantMember: {
    context: authSchemas.ref.AuthTenantContext,
    tenantRoles: '*',
  },

  tenantAdmin: {
    context: authSchemas.ref.AuthTenantContext,
    tenantRoles: {
      owner: true,
      admin: true,
    },
  },
});

const events = v1.defineResource({
  name: 'events',
  route: '/events',
  folders: ['event'],
  access: access.ref.tenantMember,
  ui: {
    enabled: true,
    infer: true,
  },
});

const eventSchemas = events.defineSchemas({
  EventResponse: {
    id: sharedProps.ref.uuid,
    message: sharedProps.ref.message,
  },
});

events.defineRoutes((r) =>
  r
    .get('/', 'listEvents')
    .response(eventSchemas.ref.EventResponse)
    .done()

    .patch('/:id/publish', 'publishEvent')
    .params({ id: sharedProps.ref.uuid })
    .access(access.ref.tenantAdmin)
    .tags(['tenant', 'mutation', 'lifecycle'])
    .response(eventSchemas.ref.EventResponse)
    .ui('action')
    .done()

    .get('/public-feed', 'getPublicFeed')
    .access(access.ref.public)
    .response(eventSchemas.ref.EventResponse)
    .done(),
);

assert.equal(access.ref.public.key, 'public');
assert.equal(access.ref.tenantAdmin.key, 'tenantAdmin');

const result = compileOpenApi(v1.contract, { validate: false });
assert.equal(result.success, true);
if (!result.success) {
  throw new Error('Expected compileOpenApi to succeed.');
}

const document = result.document;
const schemas = document.components.schemas as Record<string, Record<string, unknown>>;

function operation(path: string, method: string): Record<string, unknown> {
  const pathItem = document.paths[path] as Record<string, unknown> | undefined;
  assert.ok(pathItem, `Expected path ${path}`);

  const op = pathItem[method] as Record<string, unknown> | undefined;
  assert.ok(op, `Expected ${method.toUpperCase()} ${path}`);
  return op;
}

function codegen(path: string, method: string): Record<string, unknown> {
  const meta = operation(path, method)[CODEGEN_EXTENSION_KEY] as Record<string, unknown> | undefined;
  assert.ok(meta, `Expected x-codegen for ${method.toUpperCase()} ${path}`);
  return meta;
}

assert.ok(schemas.AuthUserContext);
assert.ok(schemas.AuthTenantContext);
assert.deepEqual((schemas.AuthTenantContext[CODEGEN_EXTENSION_KEY] as Record<string, unknown>).role, 'context');
assert.deepEqual((schemas.AuthTenantContext[CODEGEN_EXTENSION_KEY] as Record<string, unknown>).resource, {
  name: 'auth',
  path: ['_global'],
});
assert.deepEqual((schemas.AuthSystemRole[CODEGEN_EXTENSION_KEY] as Record<string, unknown>).role, 'access-role');
assert.deepEqual((schemas.AuthTenantRole[CODEGEN_EXTENSION_KEY] as Record<string, unknown>).role, 'access-role');

assert.deepEqual(codegen('/events', 'get').access, {
  key: 'tenantMember',
  context: {
    $ref: '#/components/schemas/AuthTenantContext',
  },
  tenantRoles: '*',
});

assert.deepEqual(codegen('/events/{id}/publish', 'patch').access, {
  key: 'tenantAdmin',
  context: {
    $ref: '#/components/schemas/AuthTenantContext',
  },
  tenantRoles: {
    owner: true,
    admin: true,
  },
});
assert.deepEqual(codegen('/events/{id}/publish', 'patch').tags, ['tenant', 'mutation', 'lifecycle']);

assert.deepEqual(codegen('/events/public-feed', 'get').access, {
  key: 'public',
  context: null,
});

assert.equal(schemas.tenantAdmin, undefined);
