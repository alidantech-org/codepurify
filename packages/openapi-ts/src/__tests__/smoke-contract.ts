import { defineVersionContract, ContentType, HttpMethod, QueryBehavior, schema } from '../index.js';
import { z } from 'zod';

// Version contract with content type defaults
const v1 = defineVersionContract({
  info: {
    title: 'Smoke API',
    version: 'v1',
    description: 'Smoke test for final API',
  },
  defaults: {
    requestContentType: ContentType.json,
    responseContentType: ContentType.json,
  },
});

// Shared resource
const shared = v1.defineResource({
  key: 'shared',
  name: 'Shared',
  basePath: '/_shared',
});

const sharedProps = shared.defineProperties();

// Define primitives in defineProperties
const sharedPrimitives = sharedProps.shared('SharedPrimitives', {
  mongoId: schema.primitive(z.string().regex(/^[a-f\d]{24}$/i), {
    description: 'Mongo ObjectId',
  }),
  dateTime: schema.primitive(z.string().datetime(), {
    description: 'ISO datetime',
  }),
  success: schema.primitive(z.boolean(), {
    description: 'Request success state',
  }),
  message: schema.primitive(z.string().min(1).max(500), {
    description: 'Human readable message',
  }),
  page: schema.primitive(z.number().int().positive().max(10000), {
    required: false,
  }),
  limit: schema.primitive(z.number().int().positive().max(100), {
    required: false,
  }),
});

// Base entity uses schema.ref() when reusing refs (property definition context)
const baseEntity = sharedProps.entity(
  'BaseEntity',
  {
    id: schema.ref(sharedPrimitives.ref.mongoId),
    createdAt: schema.ref(sharedPrimitives.ref.dateTime),
    updatedAt: schema.ref(sharedPrimitives.ref.dateTime),
  },
  {
    abstract: true,
  },
);

// Shared schemas use direct refs only
const sharedSchemas = v1.defineSchemas({
  ApiMessage: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
  },
  PaginatedMeta: {
    page: sharedPrimitives.ref.page,
    limit: sharedPrimitives.ref.limit,
  },
  ValidationError: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
  },
});

// User resource
const users = v1.defineResource({
  key: 'users',
  name: 'User',
  basePath: '/users',
});

const userProps = users.defineProperties();

// Entity fields use schema.ref() only when reusing refs (property definition context)
const userEntity = userProps.entity(
  'User',
  {
    email: schema.primitive(z.string().email()),
    name: schema.primitive(z.string().min(1).max(100)),
    ownerId: schema.ref(sharedPrimitives.ref.mongoId, {
      query: { methods: [QueryBehavior.exact] },
    }),
  },
  {
    extends: baseEntity,
  },
);

// User schemas use direct refs and ref usages (array/extendWith)
const userSchemas = users.defineSchemas({
  UserOk: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: userEntity.ref.publicModel,
  },
  UsersListOk: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: userEntity.ref.publicModel.array(),
    meta: sharedSchemas.ref.PaginatedMeta,
  },
  UserWithExtra: {
    success: sharedPrimitives.ref.success,
    message: sharedPrimitives.ref.message,
    data: userEntity.ref.publicModel.extendWith({
      relatedUsers: userEntity.ref.publicModel.array(),
    }),
  },
  CreateUserBody: {
    email: userEntity.ref.fields.email,
    name: userEntity.ref.fields.name,
    ownerId: userEntity.ref.fields.ownerId,
  },
});

// Routes should infer wrappers
users.defineRoutes({
  parameters: {
    '/:userId': {
      userId: userEntity.ref.fields.id,
    },
  },
  routes: {
    listUsers: {
      method: HttpMethod.get,
      path: '/',
      summary: 'List users',
      query: {
        page: sharedPrimitives.ref.page.optional(),
        limit: sharedPrimitives.ref.limit.optional(),
      },
      response: userSchemas.ref.UsersListOk,
    },
    createUser: {
      method: HttpMethod.post,
      path: '/',
      summary: 'Create user',
      body: userSchemas.ref.CreateUserBody,
      responses: {
        201: userSchemas.ref.UserOk,
      },
    },
    deleteUser: {
      method: HttpMethod.delete,
      path: '/:userId',
      summary: 'Delete user',
      responses: {
        204: schema.noContent(),
      },
    },
  },
});

// Default responses use schema refs
v1.setDefaultResponses({
  400: sharedSchemas.ref.ApiMessage,
  422: {
    schema: sharedSchemas.ref.ValidationError,
    description: 'Validation failed',
  },
});

export const smokeContract = {
  v1,
  sharedContract: {
    shared,
    sharedPrimitives,
    baseEntity,
    sharedSchemas,
  },
  userContract: {
    users,
    userEntity,
    userSchemas,
  },
};

export type SmokeContract = typeof smokeContract;
