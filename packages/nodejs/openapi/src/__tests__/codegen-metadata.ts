import { strict as assert } from 'node:assert';
import { z } from 'zod';
import { CODEGEN_EXTENSION_KEY, HttpMethod, compileOpenApi, defineVersionContract } from '../index.js';

const v1 = defineVersionContract({
  info: {
    title: 'Codegen metadata',
    version: 'v1',
  },
});

const users = v1.defineResource({
  name: 'User',
  route: '/users',
});

const props = users.defineProperties('User', {
  id: z.string(),
  email: z.string().email(),
});

const schemas = users.defineSchemas({
  UserQuery: {
    id: props.ref.id.optional(),
  },

  CreateUserBody: {
    email: props.ref.email,
  },

  UserOk: {
    id: props.ref.id,
    email: props.ref.email,
  },
});

users.defineRoutes({
  routes: {
    createUser: {
      method: HttpMethod.post,
      path: '/',
      query: schemas.ref.UserQuery,
      body: schemas.ref.CreateUserBody,
      responses: {
        201: schemas.ref.UserOk,
      },
    },
  },
});

const result = compileOpenApi(v1.contract, { validate: false });
assert.equal(result.success, true);

const userQuery = result.document.components.schemas.UserQuery as Record<string, unknown>;
const createUserBody = result.document.components.schemas.CreateUserBody as Record<string, unknown>;
const userOk = result.document.components.schemas.UserOk as Record<string, unknown>;

assert.equal((userQuery[CODEGEN_EXTENSION_KEY] as { role?: string }).role, 'query');
assert.equal((createUserBody[CODEGEN_EXTENSION_KEY] as { role?: string }).role, 'body');
assert.equal((userOk[CODEGEN_EXTENSION_KEY] as { role?: string }).role, 'response');
