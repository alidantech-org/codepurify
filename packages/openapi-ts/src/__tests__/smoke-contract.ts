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
  parameters: { '/:userId': { userId: userEntity.ref.fields.id } },
  routes: {
    listUsers: {
      method: HttpMethod.get,
      path: '/',
      summary: 'List users',
      query: {
        page: sharedPrimitives.ref.page.optional(),
        limit: sharedPrimitives.ref.limit.optional(),
        search: sharedPrimitives.ref.search.optional(),
        isOnline: userEntity.ref.fields.isOnline.optional(),
      },
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
  parameters: { '/:vehicleId': { vehicleId: vehicleEntity.ref.fields.id } },
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
