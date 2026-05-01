/**
 * @file user.config.ts
 * @description Configuration for the User entity
 */

// //////////////////////////////////////////////////////////////////////////////
//  IMPORTS
// //////////////////////////////////////////////////////////////////////////////

import * as T from './user.types';
import * as B from '../../../shared/base';

// tempura items
import { DefineKeysArray } from '../../../tempura/fields.defination';
import { EntityDBDefinition, EntityMeta } from '../../../tempura/database.defination';
import { APP_META } from '../../platform/app';
import { EUserRole, EUserStatus } from '../../../enums/auth';

const { query: q, mutation: m } = B.BASE_FIELDS;

// //////////////////////////////////////////////////////////////////////////////
//  CONST KEY ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export const USER_FIELDS: DefineKeysArray<T.IUser> = {
  query: {
    selectable: [
      ...q.selectable,
      'email',
      'username',
      'firstName',
      'lastName',
      'isActive',
      'isVerified',
      'status',
      'role',
      'lastLoginAt',
      'passwordChangedAt',
    ],
    defaultSelect: [...q.defaultSelect, 'email', 'username', 'firstName', 'lastName', 'isActive', 'isVerified', 'status', 'role'],
    sortable: [...q.sortable, 'email', 'username', 'firstName', 'lastName', 'status', 'role', 'lastLoginAt', 'passwordChangedAt'],
    searchable: [...q.searchable, 'email', 'username', 'firstName', 'lastName'],
    filterable: [...q.filterable, 'status', 'role', 'isActive', 'isVerified'],
    dateRange: [...q.dateRange, 'lastLoginAt', 'passwordChangedAt'],
  },

  mutation: {
    creatable: ['email', 'username', 'firstName', 'lastName', 'isActive', 'isVerified', 'role'],
    systemCreatable: [
      'email',
      'username',
      'firstName',
      'lastName',
      'isActive',
      'isVerified',
      'status',
      'role',
      'lastLoginAt',
      'passwordChangedAt',
    ],
    updatable: ['username', 'firstName', 'lastName', 'isActive', 'isVerified', 'role'],
    editable: [
      'email',
      'username',
      'firstName',
      'lastName',
      'isActive',
      'isVerified',
      'status',
      'role',
      'lastLoginAt',
      'passwordChangedAt',
    ],
    readonly: [...m.readonly, 'apps'],
    immutable: [...m.immutable, 'apps'],
  },

  relation: { keys: ['apps'] },

  state: { transition: ['status'], toggle: ['isActive', 'isVerified'] },

  business: { contextual: [] },

  security: { sensitive: [] },

  system: { persisted: [], computed: [] },
} as const;

export const USER_META: EntityMeta = {
  name: 'User',
  module: 'platform',
  schema: 'platform',
  tableName: 'users',
  route: 'users',
  entityClass: 'UserEntity',
};

export const USER_DB: EntityDBDefinition<T.IUser, B.IBase, 'typeorm'> = {
  target: { provider: 'typeorm', dialect: 'postgres', schema: 'platform', tableName: 'users' },

  fields: {
    email: { type: 'varchar', name: 'email', length: 255, unique: true },
    username: { type: 'varchar', name: 'username', length: 100, unique: true },
    firstName: { type: 'varchar', name: 'first_name', length: 100 },
    lastName: { type: 'varchar', name: 'last_name', length: 100 },
    isActive: { type: 'boolean', name: 'is_active', default: true },
    isVerified: { type: 'boolean', name: 'is_verified', default: false },
    status: { type: 'simple-enum', name: 'status', enum: EUserStatus },
    role: { type: 'simple-enum', name: 'role', enum: EUserRole },
    lastLoginAt: { type: 'timestamp', name: 'last_login_at', nullable: true },
    passwordChangedAt: { type: 'timestamp', name: 'password_changed_at', nullable: true },
  },

  relations: {
    apps: { kind: 'one-to-many', entityMeta: APP_META, inverseSide: 'owner', cascade: true },
  },

  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['status'] },
    { fields: ['role'] },
    { fields: ['isActive'] },
    { fields: ['isVerified'] },
    { fields: ['lastLoginAt'] },
    { fields: ['email', 'status'] },
    { fields: ['username', 'status'] },
  ],

  checks: [
    { name: 'chk_user_email_not_empty', expression: `email <> ''` },
    { name: 'chk_user_username_not_empty', expression: `username <> ''` },
    { name: 'chk_user_email_format', expression: `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'` },
    { name: 'chk_user_username_length', expression: `LENGTH(username) >= 3` },
  ],

  options: { timestamps: true, audit: true, softDelete: true },
} as const;
