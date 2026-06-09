import { z } from 'zod';
import { sharedContract } from '../_global/shared.contract.js';
import { v1 } from '../_global/version.contract.js';

const USER_SELECT_VALUES = ['email', 'name', 'phone', 'avatar', 'roles', 'status', 'emailVerified', 'isOnline'] as const;
const USER_SORT_VALUES = ['+createdAt', '-createdAt', '+name', '-name', '+status', '-status', '+isOnline', '-isOnline'] as const;

const UserRoles = ['rider', 'driver', 'admin'] as const;
const UserStatus = ['active', 'disabled', 'pending'] as const;

const users = v1.defineResource({
  name: 'users',
  route: 'v1/users',
  folders: ['platform'],
  ui: {
    enabled: true,
    infer: true,
  },
});

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

const userProjectionSchemas = users.defineSchemas({
  UserPartial: userPublicSchemas.ref.UserPublic.partial(),

  UserPreview: userPublicSchemas.ref.UserPublic.pick({
    id: true,
    email: true,
    name: true,
    avatar: true,
    status: true,
    createdAt: true,
  }),

  UserFilterable: userPublicSchemas.ref.UserPublic.pick({
    status: true,
    roles: true,
    emailVerified: true,
    isOnline: true,
  }).partial(),
});

const userFilterSchemas = users.defineSchemas({
  UserFilters: userProjectionSchemas.ref.UserFilterable.extendWith({
    createdAt: sharedContract.sharedSchemas.ref.DateRangeQuery.optional(),
    updatedAt: sharedContract.sharedSchemas.ref.DateRangeQuery.optional(),
  }),
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
    users: userProjectionSchemas.ref.UserPreview.array(),
    pagination: sharedContract.sharedSchemas.ref.PaginationMeta,
  }),

  UserOk: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    user: userProjectionSchemas.ref.UserPartial,
  }),

  CreateUserBody: {
    email: userProps.ref.email,
    name: userProps.ref.name,
    phone: userProps.ref.phone.optional().nullable(),
  },

  UpdateUserBody: userPublicSchemas.ref.UserPublic.pick({
    email: true,
    name: true,
    phone: true,
    avatar: true,
  }).partial(),

  UserDeleted: sharedContract.sharedSchemas.ref.ApiMessage.extendWith({
    deletedId: userProps.ref.id,
  }),
});

users.defineRoutes((r) =>
  r
    .get('/', 'listUsers')
    .summary('List users')
    .query(userSchemas.ref.UserListQuery)
    .response(userSchemas.ref.UsersListOk)
    .ui('list')
    .done()

    .post('/', 'createUser')
    .summary('Create user')
    .body(userSchemas.ref.CreateUserBody)
    .on(201, userSchemas.ref.UserOk)
    .on(409, sharedContract.sharedSchemas.ref.ApiMessage)
    .ui('create')
    .done()

    .get('/me', 'getCurrentUser')
    .summary('Get current user')
    .query(userSchemas.ref.UserDetailQuery)
    .response(userSchemas.ref.UserOk)
    .ui({ enabled: false })
    .done()

    .get('/:userId', 'getUserById')
    .params({ userId: userProps.ref.id })
    .summary('Get user by ID')
    .query(userSchemas.ref.UserDetailQuery)
    .response(userSchemas.ref.UserOk)
    .ui('detail')
    .done()

    .patch('/:userId', 'updateUser')
    .params({ userId: userProps.ref.id })
    .summary('Update user')
    .body(userSchemas.ref.UpdateUserBody)
    .response(userSchemas.ref.UserOk)
    .ui('update')
    .done()

    .delete('/:userId', 'deleteUser')
    .params({ userId: userProps.ref.id })
    .summary('Delete user')
    .response(userSchemas.ref.UserDeleted)
    .ui('delete')
    .done(),
);

export const userContract = {
  users,
  userProps,
  userQueryProps,
  userPublicSchemas,
  userProjectionSchemas,
  userFilterSchemas,
  userSchemas,
};
