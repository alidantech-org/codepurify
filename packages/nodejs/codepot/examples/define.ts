import z from 'zod';
import { defineVersion, schema, QueryOperator, UrlEnv, HttpMethod } from '../src/contract/functions/define';
import { writeFileSync } from 'fs';

// ============================================================================
// VERSION
// ============================================================================

export const v1 = defineVersion({
  codepot: '1.0.0',
  key: 'riderescue_api',
  version: 1,
  info: {
    title: 'Riderescue API',
    version: 'v1',
    description: 'Riderescue backend API',
    license: { name: 'MIT', identifier: 'MIT' },
  },
  urls: [
    { env: UrlEnv.production, uri: 'https://api.riderescue.com' },
    { env: UrlEnv.local, uri: 'http://localhost:3000' },
  ],
  defaults: {
    requestContentType: 'json',
    responseContentType: 'json',
  },
});

// ============================================================================
// SHARED RESOURCE
// ============================================================================

const shared = v1.resource({ key: 'shared', description: 'Shared primitives and base definitions' });

const sharedPrimitives = shared.primitives('Shared', {
  mongoId: { schema: z.string().regex(/^[a-f\d]{24}$/i), description: 'MongoDB ObjectId' },
  dateTime: { schema: z.string().datetime(), description: 'ISO 8601 datetime' },
  displayName: { schema: z.string().min(1).max(100), description: 'Display name' },
  success: { schema: z.boolean(), description: 'Request success' },
  message: { schema: z.string().min(1).max(500), description: 'Human readable message' },
  page: { schema: z.number().int().positive().max(10000), required: false },
  limit: { schema: z.number().int().positive().max(100), required: false },
  total: { schema: z.number().int().nonnegative(), required: false },
  sort: { schema: z.string(), required: false },
  search: { schema: z.string(), required: false },
  fields: { schema: z.string(), required: false },
  populate: { schema: z.string(), required: false },
});

const baseEntity = shared.entity()('Base', {
  abstract: true,
  fields: {
    id: schema.ref(sharedPrimitives.mongoId),
    createdAt: schema.ref(sharedPrimitives.dateTime),
    updatedAt: schema.ref(sharedPrimitives.dateTime),
    deletedAt: schema.ref(sharedPrimitives.dateTime, {
      nullable: true,
      access: { read: 'internal' },
      query: { select: false },
    }),
  },
});

const sharedSchemas = shared.schemas({
  ApiMessage: {
    success: sharedPrimitives.success,
    message: sharedPrimitives.message,
  },
  PaginatedMeta: {
    page: sharedPrimitives.page,
    limit: sharedPrimitives.limit,
    total: sharedPrimitives.total,
  },
  PaginatedQuery: {
    page: sharedPrimitives.page.optional(),
    limit: sharedPrimitives.limit.optional(),
    sort: sharedPrimitives.sort.optional(),
    fields: sharedPrimitives.fields.optional(),
    populate: sharedPrimitives.populate.optional(),
    search: sharedPrimitives.search.optional(),
  },
  DetailsQuery: {
    fields: sharedPrimitives.fields.optional(),
    populate: sharedPrimitives.populate.optional(),
  },
  PaginatedResponse: {
    success: sharedPrimitives.success,
    message: sharedPrimitives.message,
  },
});

export const sharedContract = { sharedPrimitives, baseEntity, sharedSchemas };

// ============================================================================
// USERS RESOURCE
// ============================================================================

const users = v1.resource({ key: 'users', route: '/users', folders: ['platform', 'auth'] });

const userEntity = users.entity<{ id: string; email: string; name: string }>()('User', {
  extends: sharedContract.baseEntity,
  fields: {
    email: schema.primitive(z.string().email(), {
      query: { filter: true, sort: true, operators: [QueryOperator.eq, QueryOperator.contains] },
    }),
    name: schema.ref(sharedContract.sharedPrimitives.displayName, {
      query: { filter: true, sort: true, operators: [QueryOperator.eq, QueryOperator.contains] },
    }),
    phone: schema.primitive(z.string(), {
      required: false,
      nullable: true,
      query: { filter: true, operators: [QueryOperator.eq, QueryOperator.contains] },
    }),
    avatar: schema.primitive(z.string().url(), {
      required: false,
      nullable: true,
    }),
    password: schema.primitive(z.string(), {
      access: { read: 'secret', write: 'internal' },
      query: { select: false },
    }),
    roles: schema.primitive(z.enum(['admin', 'user', 'driver', 'service_provider']), {
      query: { filter: true, sort: true, operators: [QueryOperator.eq, QueryOperator.in] },
    }),
    status: schema.primitive(z.enum(['active', 'suspended', 'deleted']), {
      query: { filter: true, sort: true, operators: [QueryOperator.eq, QueryOperator.in] },
    }),
    emailVerified: schema.primitive(z.boolean(), {
      query: { filter: true, operators: [QueryOperator.eq] },
    }),
    isOnline: schema.primitive(z.boolean(), {
      query: { filter: true, sort: true, operators: [QueryOperator.eq] },
    }),
  },
});

const userSchemas = users.schemas({
  UserListQuery: sharedSchemas.PaginatedQuery.extend({
    filter: userEntity.models.query.filter.optional(),
    sort: userEntity.models.query.sort,
    select: userEntity.models.query.select.array().optional(),
  }),
  UserDetailQuery: sharedSchemas.DetailsQuery.extend({
    select: userEntity.models.query.select.array().optional(),
  }),
  UsersListOk: sharedSchemas.PaginatedResponse.extend({
    users: userEntity.models.public.array(),
    pagination: sharedSchemas.PaginatedMeta,
  }),
  UserOk: sharedSchemas.ApiMessage.extend({
    user: userEntity.models.public,
  }),
  CreateUserBody: {
    email: userEntity.fields.email,
    name: userEntity.fields.name,
    phone: userEntity.fields.phone.optional().nullable(),
  },
  UpdateUserBody: {
    email: userEntity.fields.email.optional(),
    name: userEntity.fields.name.optional(),
    phone: userEntity.fields.phone.optional().nullable(),
    avatar: userEntity.fields.avatar.optional().nullable(),
  },
  UserDeleted: sharedSchemas.ApiMessage,
});

users.routes({
  params: { userId: userEntity.fields.id },

  list: {
    method: HttpMethod.get,
    path: '/',
    summary: 'List users',
    query: userSchemas.UserListQuery,
    response: { 200: userSchemas.UsersListOk },
  },
  create: {
    method: HttpMethod.post,
    path: '/',
    summary: 'Create user',
    body: userSchemas.CreateUserBody,
    response: { 201: userSchemas.UserOk, 409: sharedSchemas.ApiMessage },
  },
  me: {
    method: HttpMethod.get,
    path: '/me',
    summary: 'Get current user',
    query: userSchemas.UserDetailQuery,
    response: { 200: userSchemas.UserOk },
  },
  getById: {
    method: HttpMethod.get,
    path: '/:userId',
    summary: 'Get user by ID',
    query: userSchemas.UserDetailQuery,
    response: { 200: userSchemas.UserOk },
  },
  update: {
    method: HttpMethod.patch,
    path: '/:userId',
    summary: 'Update user',
    body: userSchemas.UpdateUserBody,
    response: { 200: userSchemas.UserOk },
  },
  delete: {
    method: HttpMethod.delete,
    path: '/:userId',
    summary: 'Delete user',
    response: { 200: userSchemas.UserDeleted },
  },
});

export const userContract = { users, userEntity, userSchemas };

// Emit JSON
writeFileSync('v1-contract.json', JSON.stringify(v1.toJSON(), null, 2));
console.log('Saved to v1-contract.json');
