import { HttpMethod, QueryOperator, SchemaAccess, schema } from 'codepot';
import z from 'zod';

import { sharedContract } from '../shared.resource';
import { v1 } from '../version.contract';
import { IUser } from './type';

const users = v1.defineResource({
  key: 'users',
  name: 'User',
  route: '/users',
  folders: ['platform', 'auth'],
});

const userProps = users.defineProperties();

const userEntity = userProps.entityFor<IUser>()(
  'User',
  {
    email: schema.primitive(z.string().email(), {
      query: {
        filter: true,
        operators: [QueryOperator.exact, QueryOperator.search],
        sort: true,
      },
    }),

    name: schema.ref(sharedContract.sharedPrimitives.ref.displayName, {
      query: {
        filter: true,
        operators: [QueryOperator.exact, QueryOperator.search],
        sort: true,
      },
    }),

    phone: schema.primitive(z.string(), {
      required: false,
      nullable: true,
      query: {
        filter: true,
        operators: [QueryOperator.exact, QueryOperator.search],
      },
    }),

    avatar: schema.primitive(z.string().url(), {
      required: false,
      nullable: true,
    }),

    password: schema.primitive(z.string(), {
      access: SchemaAccess.secret,
      select: false,
    }),

    roles: schema.primitive(z.enum(['admin', 'user', 'driver', 'service_provider']), {
      query: {
        filter: true,
        operators: [QueryOperator.exact, QueryOperator.in],
        sort: true,
      },
    }),

    status: schema.primitive(z.enum(['active', 'suspended', 'deleted']), {
      query: {
        filter: true,
        operators: [QueryOperator.exact, QueryOperator.in],
        sort: true,
      },
    }),

    emailVerified: schema.primitive(z.boolean(), {
      query: {
        filter: true,
        operators: [QueryOperator.exact],
      },
    }),

    isOnline: schema.primitive(z.boolean(), {
      query: {
        filter: true,
        operators: [QueryOperator.exact],
        sort: true,
      },
    }),
  },
  {
    extends: sharedContract.baseEntity,
  },
);

const userSchemas = users.defineSchemas({
  UserListQuery: sharedContract.sharedSchemas.ref.PaginatedQuery.extendWith({
    filter: userEntity.ref.queryFilterModel.optional(),
    sort: userEntity.ref.values.querySort.optional(),
    select: userEntity.ref.values.querySelect.array().optional(),
  }),

  UserDetailQuery: sharedContract.sharedSchemas.ref.DetailsQuery.extendWith({
    select: userEntity.ref.values.querySelect.array().optional(),
  }),

  UsersListOk: sharedContract.sharedSchemas.ref.PaginatedResponse.extendWith({
    users: userEntity.ref.publicModel.array(),
    pagination: sharedContract.sharedSchemas.ref.PaginatedMeta,
  }),

  UserOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    user: userEntity.ref.publicModel,
  }),

  CreateUserBody: {
    email: userEntity.ref.fields.email,
    name: userEntity.ref.fields.name,
    phone: userEntity.ref.fields.phone.optional().nullable(),
  },

  UpdateUserBody: {
    email: userEntity.ref.fields.email.optional(),
    name: userEntity.ref.fields.name.optional(),
    phone: userEntity.ref.fields.phone.optional().nullable(),
    avatar: userEntity.ref.fields.avatar.optional().nullable(),
  },

  UserDeleted: sharedContract.sharedSchemas.ref.ApiMessage,
});

users.defineRoutes({
  parameters: {
    userId: userEntity.ref.fields.id,
  },

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
      responses: {
        201: userSchemas.ref.UserOk,
        409: sharedContract.sharedSchemas.ref.ApiMessage,
      },
    },

    getCurrentUser: {
      method: HttpMethod.get,
      path: '/me',
      summary: 'Get current user',
      query: userSchemas.ref.UserDetailQuery,
      response: userSchemas.ref.UserOk,
    },

    getUserById: {
      method: HttpMethod.get,
      path: '/:userId',
      summary: 'Get user by ID',
      query: userSchemas.ref.UserDetailQuery,
      response: userSchemas.ref.UserOk,
    },

    updateUser: {
      method: HttpMethod.patch,
      path: '/:userId',
      summary: 'Update user',
      body: userSchemas.ref.UpdateUserBody,
      response: userSchemas.ref.UserOk,
    },

    deleteUser: {
      method: HttpMethod.delete,
      path: '/:userId',
      summary: 'Delete user',
      response: userSchemas.ref.UserDeleted,
    },
  },
});

export const userContract = {
  users,
  userEntity,
};
