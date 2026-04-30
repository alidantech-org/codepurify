/**
 * @file user.types.tg.ts
 * @description Generated types for the User entity
 */

// //////////////////////////////////////////////////////////////////////////////
//  FIELD GROUPS
// //////////////////////////////////////////////////////////////////////////////

import * as Q from '../../../shared/query';
import * as T from './user.types';
import * as TC from './user.config';

// //////////////////////////////////////////////////////////////////////////////
//  UNION TYPES FROM ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export type UserRelationKey = (typeof TC.USER_FIELDS.relation.keys)[number];

export type IUserContextualFields = (typeof TC.USER_FIELDS.business.contextual)[number];

export type IUserTransitionFields = (typeof TC.USER_FIELDS.state.transition)[number];

export type IUserToggleFields = (typeof TC.USER_FIELDS.state.toggle)[number];

export type UserSearchableField = (typeof TC.USER_FIELDS.query.searchable)[number];

export type UserFilterableField = (typeof TC.USER_FIELDS.query.filterable)[number];

export type UserDefaultSelectField = (typeof TC.USER_FIELDS.query.defaultSelect)[number];

export type UserSelectableField = (typeof TC.USER_FIELDS.query.selectable)[number];

export type UserSortableField = (typeof TC.USER_FIELDS.query.sortable)[number];

export type UserDateRangeField = (typeof TC.USER_FIELDS.query.dateRange)[number];

export type UserCreatableField = (typeof TC.USER_FIELDS.mutation.creatable)[number];

export type UserSystemCreatableField = (typeof TC.USER_FIELDS.mutation.systemCreatable)[number];

export type UserUpdatableField = (typeof TC.USER_FIELDS.mutation.updatable)[number];

export type UserEditableField = (typeof TC.USER_FIELDS.mutation.editable)[number];

export type IUserReadonlyFields = (typeof TC.USER_FIELDS.mutation.readonly)[number];

export type IUserImmutableFields = (typeof TC.USER_FIELDS.mutation.immutable)[number];

export type UserSensitiveField = (typeof TC.USER_FIELDS.security.sensitive)[number];

export type UserSystemField = (typeof TC.USER_FIELDS.system.persisted)[number];

export type UserComputedField = (typeof TC.USER_FIELDS.system.computed)[number];

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERIES
// //////////////////////////////////////////////////////////////////////////////

export interface IUserRelationMap extends Record<UserRelationKey, unknown> {
  apps: any; // Will be updated when App types are available
}

export type UserKey = keyof T.IUser;

// //////////////////////////////////////////////////////////////////////////////
//  QUERY CONTRACTS
// //////////////////////////////////////////////////////////////////////////////

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IUserAsOneRelationConfig = Q.IOneRelationConfig<'user', UserSelectableField>;

export type IUserAsManyRelationConfig = Q.IManyRelationConfig<'users', UserSelectableField, UserSortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  FILTER TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IUserFilter = Q.IBaseFilter<T.IUser, UserFilterableField>;

export type IUserItemQuery = Q.IBaseItemQuery<
  T.IUser,
  UserRelationKey,
  UserSelectableField,
  UserRelationKey,
  UserSelectableField,
  IUserRelationMap,
  IUserRelationQueries
>;

export type IUserListQuery = Q.IBaseListQuery<
  T.IUser,
  UserRelationKey,
  UserSelectableField,
  UserSortableField,
  UserRelationKey,
  UserSelectableField,
  UserSortableField,
  UserDateRangeField,
  IUserFilter,
  IUserRelationMap,
  IUserRelationQueries,
  IUserItemQuery
>;

export type IUserRelationQueries = Q.IBaseRelationQueries<T.IUser, UserRelationKey, IUserRelationMap>;

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERY TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IUserAsOneRelationQuery = Q.IAsOneRelationQuery<T.IUser, UserSelectableField>;

export type IUserAsManyRelationQuery = Q.IAsManyRelationQuery<T.IUser, UserSelectableField, UserSortableField>;
