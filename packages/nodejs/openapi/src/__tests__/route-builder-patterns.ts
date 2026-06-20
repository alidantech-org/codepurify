import { strict as assert } from 'node:assert';
import { z } from 'zod';
import { HttpMethod, compileOpenApi, defineVersionContract, schema } from '../index.js';

const v1 = defineVersionContract({
  info: {
    title: 'Route Builder Pattern API',
    version: 'v1',
  },
});

const sharedProps = v1.defineProperties('Shared', {
  id: z.string(),
  message: z.string(),
});

const objectResource = v1.defineResource({
  name: 'ObjectUser',
  route: '/object-users',
});

const builderResource = v1.defineResource({
  name: 'BuilderUser',
  route: '/builder-users',
});

const companyMembersResource = v1.defineResource({
  name: 'CompanyMembers',
  route: '/companies/:companyId/members',
});

const localParamsResource = v1.defineResource({
  name: 'LocalParams',
  route: '/local-params',
});

const normalizedRouteResource = v1.defineResource({
  name: 'NormalizedRoutes',
  route: '///v1//vehicles/',
});

const windowsRouteResource = v1.defineResource({
  name: 'WindowsRoutes',
  route: 'v1\\garages',
});

const objectSchemas = objectResource.defineSchemas({
  ListQuery: {
    search: sharedProps.ref.message.optional(),
  },
  UserBody: {
    name: sharedProps.ref.message,
  },
  UserOk: {
    id: sharedProps.ref.id,
    message: sharedProps.ref.message,
  },
});

const builderSchemas = builderResource.defineSchemas({
  ListQuery: {
    search: sharedProps.ref.message.optional(),
  },
  UserBody: {
    name: sharedProps.ref.message,
  },
  UserOk: {
    id: sharedProps.ref.id,
    message: sharedProps.ref.message,
  },
});

const objectRoutes = objectResource.defineRoutes({
  parameters: {
    userId: sharedProps.ref.id,
  },
  routes: {
    listUsers: {
      method: HttpMethod.get,
      path: '/',
      summary: 'List object users',
      query: objectSchemas.ref.ListQuery,
      response: objectSchemas.ref.UserOk,
    },
    createUser: {
      method: HttpMethod.post,
      path: '/',
      summary: 'Create object user',
      body: objectSchemas.ref.UserBody,
      responses: {
        201: objectSchemas.ref.UserOk,
        400: objectSchemas.ref.UserOk,
      },
    },
    deleteUser: {
      method: HttpMethod.delete,
      path: '/:userId',
      summary: 'Delete object user',
      responses: {
        204: schema.noContent(),
      },
    },
  },
});

const builderRoutes = builderResource.defineRoutes((b) =>
  b
    .params({ userId: sharedProps.ref.id })
    .get('/', 'listUsers')
    .summary('List builder users')
    .query(builderSchemas.ref.ListQuery)
    .response(builderSchemas.ref.UserOk)
    .done()
    .post('/', 'createUser')
    .summary('Create builder user')
    .body(builderSchemas.ref.UserBody)
    .on(201, builderSchemas.ref.UserOk)
    .on(400, builderSchemas.ref.UserOk)
    .done()
    .delete('/:userId', 'deleteUser')
    .summary('Delete builder user')
    .on(204, schema.noContent())
    .done(),
);

const companyMemberRoutes = companyMembersResource.defineRoutes((b) =>
  b
    .params({ companyId: sharedProps.ref.id })
    .get('/', 'listCompanyMembers')
    .summary('List company members')
    .response(builderSchemas.ref.UserOk)
    .done(),
);

const localParamRoutes = localParamsResource.defineRoutes((b) =>
  b
    .get('/:memberId', 'getLocalMember')
    .params({ memberId: sharedProps.ref.id })
    .summary('Get local member')
    .response(builderSchemas.ref.UserOk)
    .done(),
);

normalizedRouteResource.defineRoutes({
  parameters: {
    vehicleId: sharedProps.ref.id,
  },
  routes: {
    getVehicle: {
      method: HttpMethod.get,
      path: '//:vehicleId/',
      summary: 'Get normalized vehicle',
      response: builderSchemas.ref.UserOk,
    },
  },
});

windowsRouteResource.defineRoutes({
  routes: {
    listGarages: {
      method: HttpMethod.get,
      path: '\\',
      summary: 'List normalized garages',
      response: builderSchemas.ref.UserOk,
    },
  },
});

assert.deepEqual(Object.keys(objectRoutes.routes), ['listUsers', 'createUser', 'deleteUser']);
assert.deepEqual(Object.keys(builderRoutes.routes), ['listUsers', 'createUser', 'deleteUser']);
assert.equal(objectRoutes.routes.createUser.method, HttpMethod.post);
assert.equal(builderRoutes.routes.createUser.method, HttpMethod.post);
assert.deepEqual(Object.keys(objectRoutes.routes.createUser.responses ?? {}), ['201', '400']);
assert.deepEqual(Object.keys(builderRoutes.routes.createUser.responses ?? {}), ['201', '400']);
assert.ok(objectRoutes.parameters?.userId);
assert.ok(builderRoutes.parameters?.userId);

const result = compileOpenApi(v1.contract, { validate: false });
assert.equal(result.success, true);

const pathItems = Object.values(result.document.paths);
const objectListOperation = pathItems.find((pathItem) => pathItem.get?.summary === 'List object users')?.get;
const builderListOperation = pathItems.find((pathItem) => pathItem.get?.summary === 'List builder users')?.get;
const objectCreateOperation = pathItems.find((pathItem) => pathItem.post?.summary === 'Create object user')?.post;
const builderCreateOperation = pathItems.find((pathItem) => pathItem.post?.summary === 'Create builder user')?.post;
const objectDeleteOperation = pathItems.find((pathItem) => pathItem.delete?.summary === 'Delete object user')?.delete;
const builderDeleteOperation = pathItems.find((pathItem) => pathItem.delete?.summary === 'Delete builder user')?.delete;

assert.equal(objectListOperation?.summary, 'List object users');
assert.equal(builderListOperation?.summary, 'List builder users');
assert.ok(objectCreateOperation?.responses['201']);
assert.ok(builderCreateOperation?.responses['201']);
assert.ok(objectCreateOperation?.responses['400']);
assert.ok(builderCreateOperation?.responses['400']);
assert.ok(objectDeleteOperation?.responses['204']);
assert.ok(builderDeleteOperation?.responses['204']);

const companyMembersPath = result.document.paths['/companies/{companyId}/members'];
const localMemberPath = result.document.paths['/local-params/{memberId}'];
const normalizedVehiclePath = result.document.paths['/v1/vehicles/{vehicleId}'];
const normalizedGaragePath = result.document.paths['/v1/garages'];

assert.ok(companyMemberRoutes.parameters?.companyId);
assert.equal(companyMembersPath?.parameters, undefined);
assert.ok(JSON.stringify(companyMembersPath?.get?.parameters).includes('CompanyMembersCompanyIdPathParam'));
assert.ok(localParamRoutes.routes.getLocalMember.params?.memberId);
assert.equal(localMemberPath?.parameters, undefined);
assert.ok(JSON.stringify(localMemberPath?.get?.parameters).includes('LocalParamsMemberIdPathParam'));
assert.equal(normalizedVehiclePath?.parameters, undefined);
assert.ok(JSON.stringify(normalizedVehiclePath?.get?.parameters).includes('NormalizedRoutesVehicleIdPathParam'));
assert.equal(normalizedVehiclePath.get?.summary, 'Get normalized vehicle');
assert.equal(normalizedGaragePath.get?.summary, 'List normalized garages');
assert.ok(!Object.keys(result.document.paths).some((path) => !path.startsWith('/')));
assert.ok(!Object.keys(result.document.paths).some((path) => path.length > 1 && path.endsWith('/')));
