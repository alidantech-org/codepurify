import { HttpMethod } from 'codepot-openapi';
import { z } from 'zod';
import { sharedContract } from '../_global/shared.contract.js';
import { v1 } from '../_global/version.contract.js';

const USER_SELECT_VALUES = ['email', 'name', 'phone', 'avatar', 'roles', 'status', 'emailVerified', 'isOnline'] as const;
const USER_SORT_VALUES = ['+createdAt', '-createdAt', '+name', '-name', '+status', '-status', '+isOnline', '-isOnline'] as const;

const UserRoles = ['rider', 'driver', 'admin'] as const;
const UserStatus = ['active', 'disabled', 'pending'] as const;

const users = v1.defineResource({ name: 'users', route: '/users' });

const userProps = users.defineProperties('User', {
  id: z.string().regex(/^[a-f\d]{24}$/i),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phone: z.string(),
  avatar: z.string().url(),
  roles: z.enum(UserRoles).array(),
  status: z.enum(UserStatus),
  emailVerified: z.boolean(),
  isOnline: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime(),
});

const userQueryProps = users.defineProperties('UserQuery', {
  select: z.enum(USER_SELECT_VALUES),
  sort: z.enum(USER_SORT_VALUES),
});

const userPublicSchemas = users.defineSchemas({
  UserPublic: sharedContract.publicBaseEntity.extendWith({
    email: userProps.ref.email,
    name: userProps.ref.name,
    phone: userProps.ref.phone.nullable(),
    avatar: userProps.ref.avatar.nullable(),
    roles: userProps.ref.roles,
    status: userProps.ref.status,
    emailVerified: userProps.ref.emailVerified,
    isOnline: userProps.ref.isOnline,
  }),
});

const userFilterSchemas = users.defineSchemas({
  UserFilters: {
    status: userProps.ref.status.optional(),
    roles: userProps.ref.roles.optional(),
    emailVerified: userProps.ref.emailVerified.optional(),
    isOnline: userProps.ref.isOnline.optional(),
    createdAt: sharedContract.sharedSchemas.ref.DateRangeQuery.optional(),
    updatedAt: sharedContract.sharedSchemas.ref.DateRangeQuery.optional(),
  },
});

const userSchemas = users.defineSchemas({
  UserListQuery: sharedContract.sharedSchemas.ref.BaseQuery.extendWith({
    filters: userFilterSchemas.ref.UserFilters.optional(),
    fields: userQueryProps.ref.select.array().optional(),
    sort: userQueryProps.ref.sort.array().optional(),
  }),

  UserDetailQuery: sharedContract.sharedSchemas.ref.DetailsQuery.extendWith({
    fields: userQueryProps.ref.select.array().optional(),
  }),

  UsersListOk: sharedContract.sharedSchemas.ref.PaginatedResponse.extendWith({
    users: userPublicSchemas.ref.UserPublic.array(),
    pagination: sharedContract.sharedSchemas.ref.PaginationMeta,
  }),

  UserOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    user: userPublicSchemas.ref.UserPublic,
  }),

  CreateUserBody: {
    email: userProps.ref.email,
    name: userProps.ref.name,
    phone: userProps.ref.phone.optional().nullable(),
  },

  UpdateUserBody: {
    email: userProps.ref.email.optional(),
    name: userProps.ref.name.optional(),
    phone: userProps.ref.phone.optional().nullable(),
    avatar: userProps.ref.avatar.optional().nullable(),
  },

  UserDeleted: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    deletedId: userProps.ref.id,
  }),
});

users.defineRoutes({
  parameters: {
    userId: userProps.ref.id,
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
  userProps,
  userQueryProps,
  userPublicSchemas,
  userFilterSchemas,
  userSchemas,
};
