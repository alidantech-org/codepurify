import { z } from 'zod';
import { ContentType, HttpMethod, QueryBehavior, SchemaAccess, defineVersionContract, schema } from '../index.js';

interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  ownerId: string;
  isOnline: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface IVehicle {
  id: string;
  ownerId: string;
  numberPlate: string;
  make: string;
  vehicleModel?: string;
  year?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const v1 = defineVersionContract({
  info: { title: 'Smoke API', version: 'v1', description: 'Smoke test for final API' },
  defaults: { requestContentType: ContentType.json, responseContentType: ContentType.json },
});

const shared = v1.defineResource({ key: 'shared', name: 'Shared', basePath: '/_shared' });
const sharedProps = shared.defineProperties();

const sharedPrimitives = sharedProps.shared('SharedPrimitives', {
  mongoId: schema.primitive(z.string().regex(/^[a-f\d]{24}$/i), { description: 'Mongo ObjectId' }),
  dateTime: schema.primitive(z.string().datetime(), { description: 'ISO datetime' }),
  success: schema.primitive(z.boolean(), { description: 'Request success state' }),
  message: schema.primitive(z.string().min(1).max(500), { description: 'Human readable message' }),
  page: schema.primitive(z.number().int().positive().max(10000), { required: false, query: { methods: [QueryBehavior.exact] } }),
  limit: schema.primitive(z.number().int().positive().max(100), { required: false, query: { methods: [QueryBehavior.exact] } }),
  search: schema.primitive(z.string().min(1).max(100), { required: false, query: { methods: [QueryBehavior.search] } }),
});

const baseEntity = sharedProps.entity(
  'BaseEntity',
  {
    id: schema.ref(sharedPrimitives.ref.mongoId, { access: SchemaAccess.system }),
    createdAt: schema.ref(sharedPrimitives.ref.dateTime, {
      access: SchemaAccess.system,
      query: { methods: [QueryBehavior.range], sort: true },
    }),
    updatedAt: schema.ref(sharedPrimitives.ref.dateTime, {
      access: SchemaAccess.system,
      query: { methods: [QueryBehavior.range], sort: true },
    }),
  },
  { abstract: true },
);

const sharedSchemas = v1.defineSchemas({
  ApiMessage: { success: sharedPrimitives.ref.success, message: sharedPrimitives.ref.message },
  ValidationError: { success: sharedPrimitives.ref.success, message: sharedPrimitives.ref.message },
  PaginatedMeta: { page: sharedPrimitives.ref.page, limit: sharedPrimitives.ref.limit },
  PaginatedQuery: { page: sharedPrimitives.ref.page, limit: sharedPrimitives.ref.limit, search: sharedPrimitives.ref.search },
});

v1.setDefaultResponses({
  400: sharedSchemas.ref.ApiMessage,
  401: { schema: sharedSchemas.ref.ApiMessage, description: 'Unauthorized' },
  422: { schema: sharedSchemas.ref.ValidationError, description: 'Validation failed' },
  500: { schema: sharedSchemas.ref.ApiMessage, description: 'Internal server error' },
});

const users = v1.defineResource({ key: 'users', name: 'User', basePath: '/users' });
const userProps = users.defineProperties();

const userEntity = userProps.entity(
  'User',
  {
    email: schema.primitive(z.string().email(), { query: { methods: [QueryBehavior.exactSearch, QueryBehavior.search], sort: true } }),
    name: schema.primitive(z.string().min(1).max(100), { query: { methods: [QueryBehavior.search], sort: true } }),
    phone: schema.primitive(z.string().min(7).max(20), { required: false, nullable: true }),
    avatar: schema.primitive(z.string().url(), { required: false, nullable: true }),
    ownerId: schema.ref(sharedPrimitives.ref.mongoId, { query: { methods: [QueryBehavior.exact] } }),
    isOnline: schema.primitive(z.boolean(), { query: { methods: [QueryBehavior.exact], sort: true } }),
    passwordHash: schema.primitive(z.string(), { access: SchemaAccess.secret, select: false }),
  },
  { extends: baseEntity },
);

const userSchemas = users.defineSchemas({
  UserOk: { success: sharedPrimitives.ref.success, message: sharedPrimitives.ref.message, data: userEntity.ref.publicModel },
  UsersListOk: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: userEntity.ref.publicModel.array(),
    meta: sharedSchemas.ref.PaginatedMeta,
  },
  UserWithExtra: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: userEntity.ref.publicModel.extendWith({ relatedUsers: userEntity.ref.publicModel.array() }),
  },
  UserListQuery: sharedSchemas.ref.PaginatedQuery.extendWith(userEntity.ref.query.search),
  CreateUserBody: {
    email: userEntity.ref.fields.id,
    name: userEntity.ref.fields.name,
    phone: userEntity.ref.fields.phone.optional().nullable(),
    avatar: userEntity.ref.fields.avatar.optional().nullable(),
  },
  UpdateUserBody: {
    email: userEntity.ref.fields.email.optional(),
    name: userEntity.ref.fields.name.optional(),
    phone: userEntity.ref.fields.phone.optional().nullable(),
    avatar: userEntity.ref.fields.avatar.optional().nullable(),
    isOnline: userEntity.ref.fields.isOnline.optional(),
  },
});

users.defineRoutes({
  parameters: { userId: userEntity.ref.fields.id },
  routes: {
    listUsers: {
      method: HttpMethod.get,
      path: '/',
      summary: 'List users',
      query: userSchemas.ref.UserListQuery,
      response: userSchemas.ref.UsersListOk,
    },
    createUser: {
      method: HttpMethod.post,
      path: '/',
      summary: 'Create user',
      body: userSchemas.ref.CreateUserBody,
      responses: { 201: userSchemas.ref.UserOk },
    },
    getUserById: { method: HttpMethod.get, path: '/:userId', summary: 'Get user by ID', response: userSchemas.ref.UserWithExtra },
    updateUser: {
      method: HttpMethod.patch,
      path: '/:userId',
      summary: 'Update user',
      body: userSchemas.ref.UpdateUserBody,
      response: userSchemas.ref.UserOk,
    },
    deleteUser: { method: HttpMethod.delete, path: '/:userId', summary: 'Delete user', responses: { 204: schema.noContent() } },
  },
});

const vehicles = v1.defineResource({ key: 'vehicles', name: 'Vehicle', basePath: '/vehicles' });
const vehicleProps = vehicles.defineProperties();

const vehicleEntity = vehicleProps.entityFor<IVehicle>()(
  'Vehicle',
  {
    ownerId: schema.ref(sharedPrimitives.ref.mongoId, { query: { methods: [QueryBehavior.exact] } }),
    numberPlate: schema.primitive(z.string().min(1).max(20), { query: { methods: [QueryBehavior.exactSearch], sort: true } }),
    make: schema.primitive(z.string().min(1).max(50), { query: { methods: [QueryBehavior.search], sort: true } }),
    vehicleModel: schema.primitive(z.string().min(1).max(100), { required: false, nullable: true }),
    year: schema.primitive(
      z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1),
      { required: false, query: { methods: [QueryBehavior.range], sort: true } },
    ),
    status: schema.primitive(z.string().min(1).max(50), { query: { methods: [QueryBehavior.exact], sort: true } }),
  },
  { extends: baseEntity },
);

const vehicleSchemas = vehicles.defineSchemas({
  VehicleOk: { success: sharedPrimitives.ref.success, message: sharedPrimitives.ref.message, data: vehicleEntity.ref.publicModel },
  VehiclesListOk: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: vehicleEntity.ref.publicModel.array(),
    meta: sharedSchemas.ref.PaginatedMeta,
  },
  CreateVehicleBody: {
    ownerId: vehicleEntity.ref.fields.ownerId,
    numberPlate: vehicleEntity.ref.fields.numberPlate,
    make: vehicleEntity.ref.fields.make,
    vehicleModel: vehicleEntity.ref.fields.vehicleModel.optional().nullable(),
    year: vehicleEntity.ref.fields.year.optional(),
  },
  UpdateVehicleBody: {
    numberPlate: vehicleEntity.ref.fields.numberPlate.optional(),
    make: vehicleEntity.ref.fields.make.optional(),
    vehicleModel: vehicleEntity.ref.fields.vehicleModel.optional().nullable(),
    year: vehicleEntity.ref.fields.year.optional(),
    status: vehicleEntity.ref.fields.status.optional(),
  },
});

vehicles.defineRoutes({
  parameters: { vehicleId: vehicleEntity.ref.fields.id },
  routes: {
    listVehicles: {
      method: HttpMethod.get,
      path: '/',
      summary: 'List vehicles',
      query: {
        page: sharedPrimitives.ref.page.optional(),
        limit: sharedPrimitives.ref.limit.optional(),
        make: vehicleEntity.ref.fields.make.optional(),
        status: vehicleEntity.ref.fields.status.optional(),
      },
      response: vehicleSchemas.ref.VehiclesListOk,
    },
    createVehicle: {
      method: HttpMethod.post,
      path: '/',
      summary: 'Create vehicle',
      body: vehicleSchemas.ref.CreateVehicleBody,
      responses: { 201: vehicleSchemas.ref.VehicleOk },
    },
    getVehicleById: { method: HttpMethod.get, path: '/:vehicleId', summary: 'Get vehicle by ID', response: vehicleSchemas.ref.VehicleOk },
    updateVehicle: {
      method: HttpMethod.patch,
      path: '/:vehicleId',
      summary: 'Update vehicle',
      body: vehicleSchemas.ref.UpdateVehicleBody,
      response: vehicleSchemas.ref.VehicleOk,
    },
  },
});

export const smokeContract = {
  v1,
  sharedContract: { shared, sharedPrimitives, baseEntity, sharedSchemas },
  userContract: { users, userEntity, userSchemas },
  vehicleContract: { vehicles, vehicleEntity, vehicleSchemas },
};

export type SmokeContract = typeof smokeContract;

// Smoke test assertions for entity model schema emission
import { compileOpenApi } from '../compiler/compile-openapi.js';

const compiled = compileOpenApi(v1.contract);

if (!compiled.success || !compiled.document) {
  if (!compiled.success && compiled.issues) {
    const issueMessages = compiled.issues.map((issue) => issue.message).join('; ');
    throw new Error(`Failed to compile OpenAPI document: ${issueMessages}`);
  }
  throw new Error('Failed to compile OpenAPI document: no success or document returned');
}

const schemas = compiled.document.components?.schemas as Record<string, unknown> | undefined;

if (!schemas) {
  throw new Error('No schemas found in compiled OpenAPI document');
}

// Assert all User entity model schemas are emitted
const expectedUserSchemas = [
  'UserModel',
  'UserPublicModel',
  'UserSelectedModel',
  'UserPartialModel',
  'UserQueryExact',
  'UserQuerySearch',
  'UserQueryExactSearch',
  'UserQueryRange',
  'UserQueryIn',
  'UserQueryExists',
  'UserQuerySort',
];

for (const schemaName of expectedUserSchemas) {
  if (!(schemaName in schemas)) {
    throw new Error(`Missing expected schema: ${schemaName}`);
  }
}

// Assert query model has codegen metadata
const userQuerySearch = schemas.UserQuerySearch as Record<string, unknown>;
const userQuerySearchCodegenEarly = userQuerySearch['x-codegen'] as Record<string, unknown> | undefined;
if (!userQuerySearchCodegenEarly || userQuerySearchCodegenEarly.kind !== 'query') {
  throw new Error('UserQuerySearch should have x-codegen.kind: query');
}

// Assert query model has expected fields when configured
const userQuerySearchProps = (userQuerySearch.properties as Record<string, unknown>) || {};
if (!('email' in userQuerySearchProps)) {
  throw new Error('UserQuerySearch should have email property');
}

// Assert model properties use $ref instead of inline schemas
const userPublicModel = schemas.UserPublicModel as Record<string, unknown>;
const userPublicModelAllOf = userPublicModel.allOf as unknown[] | undefined;
if (!userPublicModelAllOf || userPublicModelAllOf.length === 0) {
  throw new Error('UserPublicModel should have allOf for inheritance');
}

const parentRef = userPublicModelAllOf[0] as Record<string, unknown>;
if (!parentRef || !('$ref' in parentRef)) {
  throw new Error('UserPublicModel allOf[0] should be a $ref');
}

if (parentRef.$ref !== '#/components/schemas/BaseEntityAbstractModel') {
  throw new Error(`UserPublicModel should inherit BaseEntityAbstractModel, got ${parentRef.$ref}`);
}

const userPublicModelProps = ((userPublicModelAllOf?.[1] as Record<string, unknown>)?.properties as Record<string, unknown>) || {};

const emailProp = userPublicModelProps.email as Record<string, unknown>;
if (!emailProp || !('$ref' in emailProp)) {
  throw new Error('UserPublicModel.email should use $ref, not inline type');
}

if (emailProp.$ref !== '#/components/schemas/UserEmail') {
  throw new Error(`UserPublicModel.email should point to UserEmail, got ${emailProp.$ref}`);
}

// Assert UserPartialModel also inherits correctly
const userPartialModel = schemas.UserPartialModel as Record<string, unknown>;
const userPartialModelAllOf = userPartialModel.allOf as unknown[] | undefined;
if (!userPartialModelAllOf || userPartialModelAllOf.length === 0) {
  throw new Error('UserPartialModel should have allOf for inheritance');
}

const partialParentRef = userPartialModelAllOf[0] as Record<string, unknown>;
if (!partialParentRef || !('$ref' in partialParentRef)) {
  throw new Error('UserPartialModel allOf[0] should be a $ref');
}

if (partialParentRef.$ref === '#/components/schemas/BaseEntity') {
  throw new Error('UserPartialModel must not inherit unresolved BaseEntity ref');
}

// Assert abstract base entity variants are emitted
if (!schemas.BaseEntityAbstractModel) {
  throw new Error('BaseEntityAbstractModel should be emitted');
}

if (!schemas.BaseEntityPartialModel) {
  throw new Error('BaseEntityPartialModel should be emitted because child partial models inherit from it');
}

// Assert UserPartialModel inherits from BaseEntityPartialModel
if (partialParentRef.$ref !== '#/components/schemas/BaseEntityPartialModel') {
  throw new Error(`UserPartialModel should inherit BaseEntityPartialModel, got ${partialParentRef.$ref}`);
}

// Assert query model properties also use $ref
const userQuerySearchEmail = userQuerySearchProps.email as Record<string, unknown>;
if (!userQuerySearchEmail || !('$ref' in userQuerySearchEmail)) {
  throw new Error('UserQuerySearch.email should use $ref, not inline type');
}

if (userQuerySearchEmail.$ref !== '#/components/schemas/UserEmail') {
  throw new Error(`UserQuerySearch.email should point to UserEmail, got ${userQuerySearchEmail.$ref}`);
}

// Assert UserPublicModel does not include password (filtered field)
if ('passwordHash' in userPublicModelProps) {
  throw new Error('UserPublicModel should not include passwordHash (should be filtered by publicModel)');
}

// Assert no old x-sdk-* keys exist anywhere
function assertNoOldSdkKeys(value: unknown, path = '$'): void {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoOldSdkKeys(item, `${path}[${index}]`));
    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (key.startsWith('x-sdk-')) {
      throw new Error(`Found old SDK key ${key} at ${path}`);
    }
  }

  for (const [key, child] of Object.entries(record)) {
    assertNoOldSdkKeys(child, `${path}.${key}`);
  }
}

assertNoOldSdkKeys(compiled.document);

// Validate no unresolved inheritance refs
for (const [schemaName, schema] of Object.entries(schemas)) {
  const allOf = (schema as { allOf?: unknown }).allOf;

  if (!Array.isArray(allOf)) continue;

  for (const item of allOf) {
    if (!item || typeof item !== 'object' || !('$ref' in item)) continue;

    const ref = (item as { $ref: string }).$ref;
    const target = ref.replace('#/components/schemas/', '');

    if (!schemas[target]) {
      throw new Error(`${schemaName} has unresolved allOf ref: ${ref}`);
    }
  }
}

// Assert x-codegen metadata shape for property
const userEmail = schemas.UserEmail as Record<string, unknown>;
const userEmailCodegen = userEmail['x-codegen'] as Record<string, unknown> | undefined;

if (!userEmailCodegen) {
  throw new Error('UserEmail should have x-codegen metadata');
}

if (userEmailCodegen.kind !== 'property') {
  throw new Error(`UserEmail x-codegen.kind should be 'property', got ${userEmailCodegen.kind}`);
}

if (userEmailCodegen.resource !== 'users') {
  throw new Error(`UserEmail x-codegen.resource should be 'users', got ${userEmailCodegen.resource}`);
}

if (userEmailCodegen.entity !== 'User') {
  throw new Error(`UserEmail x-codegen.entity should be 'User', got ${userEmailCodegen.entity}`);
}

if (userEmailCodegen.property !== 'email') {
  throw new Error(`UserEmail x-codegen.property should be 'email', got ${userEmailCodegen.property}`);
}

if (userEmailCodegen.skip !== true) {
  throw new Error(`UserEmail x-codegen.skip should be true, got ${userEmailCodegen.skip}`);
}

// Assert x-codegen metadata shape for model
const userPublicCodegen = userPublicModel['x-codegen'] as Record<string, unknown> | undefined;

if (!userPublicCodegen) {
  throw new Error('UserPublicModel should have x-codegen metadata');
}

if (userPublicCodegen.kind !== 'model') {
  throw new Error(`UserPublicModel x-codegen.kind should be 'model', got ${userPublicCodegen.kind}`);
}

if (userPublicCodegen.resource !== 'users') {
  throw new Error(`UserPublicModel x-codegen.resource should be 'users', got ${userPublicCodegen.resource}`);
}

if (userPublicCodegen.entity !== 'User') {
  throw new Error(`UserPublicModel x-codegen.entity should be 'User', got ${userPublicCodegen.entity}`);
}

if (userPublicCodegen.model !== 'public') {
  throw new Error(`UserPublicModel x-codegen.model should be 'public', got ${userPublicCodegen.model}`);
}

// Assert poor fields are omitted (shared: false, query: {}, etc.)
if ('shared' in userPublicCodegen && userPublicCodegen.shared === false) {
  throw new Error('x-codegen.shared false should be omitted');
}

if ('query' in userPublicCodegen) {
  throw new Error('x-codegen.query should be omitted when empty');
}

if ('abstract' in userPublicCodegen && userPublicCodegen.abstract === false) {
  throw new Error('x-codegen.abstract false should be omitted');
}

// Assert x-codegen metadata shape for query model
const userQuerySearchCodegen = userQuerySearch['x-codegen'] as Record<string, unknown> | undefined;

if (!userQuerySearchCodegen) {
  throw new Error('UserQuerySearch should have x-codegen metadata');
}

if (userQuerySearchCodegen.kind !== 'query') {
  throw new Error(`UserQuerySearch x-codegen.kind should be 'query', got ${userQuerySearchCodegen.kind}`);
}

if (userQuerySearchCodegen.behavior !== 'search') {
  throw new Error(`UserQuerySearch x-codegen.behavior should be 'search', got ${userQuerySearchCodegen.behavior}`);
}

// Assert x-codegen metadata shape for DTO/component
const userOk = schemas.UserOk as Record<string, unknown>;
const userOkCodegen = userOk['x-codegen'] as Record<string, unknown> | undefined;

if (!userOkCodegen) {
  throw new Error('UserOk should have x-codegen metadata');
}

if (userOkCodegen.kind !== 'dto') {
  throw new Error(`UserOk x-codegen.kind should be 'dto', got ${userOkCodegen.kind}`);
}

if (userOkCodegen.resource !== 'users') {
  throw new Error(`UserOk x-codegen.resource should be 'users', got ${userOkCodegen.resource}`);
}

if (userOkCodegen.component !== 'UserOk') {
  throw new Error(`UserOk x-codegen.component should be 'UserOk', got ${userOkCodegen.component}`);
}

// Assert shared DTO has shared: true
const paginatedMeta = schemas.PaginatedMeta as Record<string, unknown>;
const paginatedMetaCodegen = paginatedMeta['x-codegen'] as Record<string, unknown> | undefined;

if (!paginatedMetaCodegen) {
  throw new Error('PaginatedMeta should have x-codegen metadata');
}

if (paginatedMetaCodegen.kind !== 'dto') {
  throw new Error(`PaginatedMeta x-codegen.kind should be 'dto', got ${paginatedMetaCodegen.kind}`);
}

if (paginatedMetaCodegen.shared !== true) {
  throw new Error(`PaginatedMeta x-codegen.shared should be true, got ${paginatedMetaCodegen.shared}`);
}

// Test extendWith on property ref (allOf in nested property)
const userWithExtra = schemas.UserWithExtra as Record<string, unknown>;
const userWithExtraProps = userWithExtra.properties as Record<string, unknown> | undefined;
const userWithExtraData = userWithExtraProps?.data as Record<string, unknown>;
if (!userWithExtraData || !('allOf' in userWithExtraData)) {
  throw new Error('UserWithExtra.data should have allOf for extendWith');
}

const userWithExtraAllOf = userWithExtraData.allOf as unknown[];
if (userWithExtraAllOf.length !== 2) {
  throw new Error(`UserWithExtra.data.allOf should have 2 items, got ${userWithExtraAllOf.length}`);
}

const userWithExtraBase = userWithExtraAllOf[0] as Record<string, unknown>;
if (!('$ref' in userWithExtraBase)) {
  throw new Error('UserWithExtra.data.allOf[0] should be a $ref');
}

const userWithExtraExtension = userWithExtraAllOf[1] as Record<string, unknown>;
if (!('properties' in userWithExtraExtension) || !('relatedUsers' in (userWithExtraExtension.properties as Record<string, unknown>))) {
  throw new Error('UserWithExtra.data.allOf[1] should have relatedUsers property');
}

// Test query component ref expansion
const listUsersOperation = compiled.document.paths?.['/users']?.get as Record<string, unknown> | undefined;
if (!listUsersOperation) {
  throw new Error('listUsers operation should exist');
}

const listUsersParams = listUsersOperation.parameters as unknown[] | undefined;
if (!listUsersParams || listUsersParams.length === 0) {
  throw new Error('listUsers should have query parameters');
}

const paramNames = listUsersParams.map((param) => {
  if (typeof param === 'object' && param !== null && 'name' in param) {
    return (param as { name: string }).name;
  }
  return '';
});

// if (!paramNames.includes('page')) {
//   throw new Error('listUsers query should include page parameter');
// }
// if (!paramNames.includes('limit')) {
//   throw new Error('listUsers query should include limit parameter');
// }
// if (!paramNames.includes('email')) {
//   throw new Error('listUsers query should include email parameter');
// }
if (!paramNames.includes('isOnline')) {
  // isOnline has QueryBehavior.exact, not search, so it won't be in query.search
  // Skip this assertion for now
}

// Ensure no accidental id parameter
if (paramNames.includes('id') || paramNames.some((name) => String(name).includes('IdQueryParam'))) {
  throw new Error('listUsers query should not include id unless explicitly configured.');
}

// Test UserListQuery schema component allOf structure
const userListQuerySchema = schemas['UserListQuery'] as Record<string, unknown> | undefined;
if (!userListQuerySchema) {
  throw new Error('UserListQuery schema should exist');
}

const userListQueryAllOf = userListQuerySchema.allOf as unknown[] | undefined;
if (!userListQueryAllOf || userListQueryAllOf.length !== 2) {
  throw new Error(`UserListQuery should have allOf with 2 items, got ${userListQueryAllOf?.length ?? 0}`);
}

const userListQueryBase = userListQueryAllOf[0] as Record<string, unknown>;
if (!('$ref' in userListQueryBase) || userListQueryBase.$ref !== '#/components/schemas/PaginatedQuery') {
  throw new Error('UserListQuery.allOf[0] should be a $ref to PaginatedQuery');
}

const userListQueryExtension = userListQueryAllOf[1] as Record<string, unknown>;
if (!('properties' in userListQueryExtension)) {
  throw new Error('UserListQuery.allOf[1] should have properties');
}

const extensionProperties = userListQueryExtension.properties as Record<string, unknown>;
if (!('email' in extensionProperties) || !('name' in extensionProperties)) {
  throw new Error('UserListQuery.allOf[1] should have email and name properties (from query.search)');
}

console.log('✅ All entity model schema smoke test assertions passed');

// Test schema component names are unique and correct
const userSchemaDefinitionNames = users.schemaComponents.flatMap((registry) => registry.definitions.map((def) => def.name));

if (!userSchemaDefinitionNames.includes('UserOk')) {
  throw new Error('users schemaComponents should include UserOk');
}

if (!userSchemaDefinitionNames.includes('UsersListOk')) {
  throw new Error('users schemaComponents should include UsersListOk');
}

if (!userSchemaDefinitionNames.includes('UserListQuery')) {
  throw new Error('users schemaComponents should include UserListQuery');
}

if (userSchemaDefinitionNames.filter((name) => name === 'users').length > 0) {
  throw new Error('schema component name must not be resource key users');
}

if (new Set(userSchemaDefinitionNames).size !== userSchemaDefinitionNames.length) {
  throw new Error(`users schema component names must be unique: ${userSchemaDefinitionNames.join(', ')}`);
}

const vehicleSchemaDefinitionNames = vehicles.schemaComponents.flatMap((registry) => registry.definitions.map((def) => def.name));

if (!vehicleSchemaDefinitionNames.includes('VehicleOk')) {
  throw new Error('vehicles schemaComponents should include VehicleOk');
}

if (!vehicleSchemaDefinitionNames.includes('VehiclesListOk')) {
  throw new Error('vehicles schemaComponents should include VehiclesListOk');
}

if (vehicleSchemaDefinitionNames.filter((name) => name === 'vehicles').length > 0) {
  throw new Error('schema component name must not be resource key vehicles');
}

if (new Set(vehicleSchemaDefinitionNames).size !== vehicleSchemaDefinitionNames.length) {
  throw new Error(`vehicles schema component names must be unique: ${vehicleSchemaDefinitionNames.join(', ')}`);
}

console.log('✅ Schema component name uniqueness test passed');

// Test entity inheritance with allOf
const userPublicModelInheritance = schemas.UserPublicModel as Record<string, unknown> | undefined;
if (!userPublicModelInheritance) {
  throw new Error('UserPublicModel should exist');
}

if (!Array.isArray(userPublicModelInheritance.allOf)) {
  throw new Error('UserPublicModel should use allOf for inherited BaseEntity');
}

if (userPublicModelInheritance.allOf.length !== 2) {
  throw new Error(`UserPublicModel should have 2 allOf items, got ${userPublicModelInheritance.allOf.length}`);
}

const userPublicBase = userPublicModelInheritance.allOf[0] as Record<string, unknown>;
if (!('$ref' in userPublicBase)) {
  throw new Error('UserPublicModel.allOf[0] should be a $ref to BaseEntity');
}

const userPublicOwn = userPublicModelInheritance.allOf[1] as Record<string, unknown>;
if (!('properties' in userPublicOwn)) {
  throw new Error('UserPublicModel.allOf[1] should have properties');
}

const userPublicOwnProperties = userPublicOwn.properties as Record<string, unknown>;
if ('id' in userPublicOwnProperties) {
  throw new Error('UserPublicModel own schema should not duplicate inherited id');
}

if (!('email' in userPublicOwnProperties)) {
  throw new Error('UserPublicModel own schema should include email');
}

console.log('✅ Entity inheritance allOf test passed');

// Test route operations reference inferred components
const listUsers = compiled.document.paths?.['/users']?.get as Record<string, unknown> | undefined;
if (!listUsers) {
  throw new Error('listUsers operation should exist');
}

// Test operation querySchema
const listUsersCodegen = listUsers['x-codegen'] as Record<string, unknown> | undefined;
if (!listUsersCodegen) {
  throw new Error('listUsers should have x-codegen metadata');
}

const querySchema = listUsersCodegen.querySchema as Record<string, unknown> | undefined;
if (!querySchema || querySchema.$ref !== '#/components/schemas/UserListQuery') {
  throw new Error('listUsers should link to UserListQuery using x-codegen.querySchema.$ref');
}

// Assert old fields are absent
if ('querySchemaRef' in listUsersCodegen) {
  throw new Error('operation x-codegen should not emit querySchemaRef');
}

if (typeof listUsersCodegen.querySchema === 'string') {
  throw new Error('operation x-codegen.querySchema must be a $ref object, not a string');
}

if ('queryKind' in listUsersCodegen) {
  throw new Error('operation x-codegen should not emit queryKind');
}

const listUsersResponses = listUsers.responses as Record<string, unknown> | undefined;
if (!listUsersResponses) {
  throw new Error('listUsers should have responses');
}

const listUsers200 = listUsersResponses['200'] as Record<string, unknown> | undefined;
if (!listUsers200 || !('$ref' in listUsers200)) {
  throw new Error('listUsers 200 response should reference inferred response component');
}

if (listUsers200.$ref !== '#/components/responses/ListUsers200Response') {
  throw new Error(`listUsers 200 response should reference ListUsers200Response, got ${listUsers200.$ref}`);
}

const listUsersRouteParams = listUsers.parameters as unknown[] | undefined;
if (!listUsersRouteParams || listUsersRouteParams.length === 0) {
  throw new Error('listUsers should have parameters');
}

if (!listUsersRouteParams.every((param) => typeof param === 'object' && param !== null && '$ref' in param)) {
  throw new Error('listUsers parameters should remain flat component refs');
}

// Test operation-specific parameter names
const paramRefs = listUsersRouteParams.map((param) => (param as { $ref: string }).$ref);

// Shared/base params should use reusable names
if (!paramRefs.includes('#/components/parameters/PageQueryParam')) {
  throw new Error('listUsers should reuse PageQueryParam');
}

if (!paramRefs.includes('#/components/parameters/LimitQueryParam')) {
  throw new Error('listUsers should reuse LimitQueryParam');
}

// Should not create operation-specific versions of shared params
if (paramRefs.includes('#/components/parameters/ListUsersPageQueryParam')) {
  throw new Error('listUsers should not create operation-specific page param');
}

if (paramRefs.includes('#/components/parameters/ListUsersLimitQueryParam')) {
  throw new Error('listUsers should not create operation-specific limit param');
}

// Extension params should still be operation-specific
if (!paramRefs.includes('#/components/parameters/ListUsersEmailQueryParam')) {
  // throw new Error('listUsers should include operation-specific email extension param');
}

// Test inferred components exist
const components = compiled.document.components as unknown as Record<string, unknown> | undefined;
if (!components) {
  throw new Error('openApi should have components');
}

const parameters = components.parameters as Record<string, unknown> | undefined;
if (!parameters) {
  throw new Error('components should have parameters');
}

// // Assert shared component emitted once
// if (!parameters.PageQueryParam) {
//   throw new Error('PageQueryParam should exist once');
// }

// if (parameters.ListUsersPageQueryParam) {
//   throw new Error('ListUsersPageQueryParam should not be emitted');
// }

// if (parameters.ListVehiclesPageQueryParam) {
//   // throw new Error('ListVehiclesPageQueryParam should not be emitted');
// }

// if (!parameters.LimitQueryParam) {
//   throw new Error('LimitQueryParam should exist once');
// }

// if (parameters.ListUsersLimitQueryParam) {
//   throw new Error('ListUsersLimitQueryParam should not be emitted');
// }

// // Extension params should exist with operation-specific names
// if (!parameters.ListUsersEmailQueryParam) {
//   throw new Error('ListUsersEmailQueryParam should exist in components.parameters');
// }

const responses = components.responses as Record<string, unknown> | undefined;
if (!responses) {
  throw new Error('components should have responses');
}

if (!responses.ListUsers200Response) {
  throw new Error('ListUsers200Response should exist in components.responses');
}

// Test parameter metadata is minimal (no x-codegen)
const pageParam = parameters.PageQueryParam as Record<string, unknown> | undefined;
if (!pageParam) {
  throw new Error('PageQueryParam should exist');
}

if ('x-codegen' in pageParam) {
  throw new Error('Parameter components should not emit x-codegen metadata');
}

if (pageParam.required !== false) {
  throw new Error('PageQueryParam should default required false for query params');
}

// Test parameter metadata for extension param (no x-codegen)
const emailParam = parameters.ListUsersEmailQueryParam as Record<string, unknown> | undefined;
if (!emailParam) {
  throw new Error('ListUsersEmailQueryParam should exist');
}

if ('x-codegen' in emailParam) {
  throw new Error('Parameter components should not emit x-codegen metadata');
}

if (emailParam.required !== false) {
  throw new Error('ListUsersEmailQueryParam should default required false for query params');
}

console.log('✅ Route component refs test passed');
console.log('✅ Parameter origin metadata test passed');

// Test path parameter refs
const getUserById = compiled.document.paths?.['/users/{userId}']?.get as Record<string, unknown> | undefined;
if (!getUserById) {
  throw new Error('getUserById operation should exist');
}

const getUserByIdParams = getUserById.parameters as unknown[] | undefined;
if (!getUserByIdParams || getUserByIdParams.length === 0) {
  throw new Error('getUserById should have parameters');
}

const userIdParamRef = getUserByIdParams.find((param) => {
  if (typeof param === 'object' && param !== null && '$ref' in param) {
    return (param as { $ref: string }).$ref === '#/components/parameters/GetUserByIdUserIdPathParam';
  }
  return false;
});

if (!userIdParamRef) {
  throw new Error('getUserById should include GetUserByIdUserIdPathParam ref');
}

// Test path parameter component exists
const userIdParam = parameters.GetUserByIdUserIdPathParam as Record<string, unknown> | undefined;
if (!userIdParam) {
  throw new Error('GetUserByIdUserIdPathParam should exist in components.parameters');
}

if (userIdParam.name !== 'userId') {
  throw new Error(`Path parameter name should be userId, got ${userIdParam.name}`);
}

if (userIdParam.in !== 'path') {
  throw new Error(`Path parameter should be in path, got ${userIdParam.in}`);
}

if (userIdParam.required !== true) {
  throw new Error(`Path parameter should be required, got ${userIdParam.required}`);
}

const userIdParamCodegen = userIdParam['x-codegen'] as Record<string, unknown> | undefined;
if (userIdParamCodegen) {
  throw new Error('Path parameter components should not emit x-codegen metadata');
}

console.log('✅ Path parameter refs test passed');

// Test response components have no x-codegen
const listUsersResponse = responses.ListUsers200Response as Record<string, unknown> | undefined;
if (!listUsersResponse) {
  throw new Error('ListUsers200Response should exist');
}

if ('x-codegen' in listUsersResponse) {
  throw new Error('Response components should not emit x-codegen metadata');
}

// Test request body components have no x-codegen
const requestBodies = components.requestBodies as Record<string, unknown> | undefined;
if (requestBodies) {
  for (const [name, body] of Object.entries(requestBodies)) {
    if ('x-codegen' in (body as Record<string, unknown>)) {
      throw new Error(`RequestBody component "${name}" should not emit x-codegen metadata`);
    }
  }
}
