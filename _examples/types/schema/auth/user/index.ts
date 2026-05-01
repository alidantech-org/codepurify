/**
 * @file index.ts
 * @description User entity exports
 */

export type { IUser, UserKey } from './user.types';
export { USER_FIELDS, USER_META, USER_DB } from './user.config';
export type {
  UserRelationKey,
  IUserContextualFields,
  IUserTransitionFields,
  IUserToggleFields,
  UserSearchableField,
  UserFilterableField,
  UserDefaultSelectField,
  UserSelectableField,
  UserSortableField,
  UserDateRangeField,
  UserCreatableField,
  UserSystemCreatableField,
  UserUpdatableField,
  UserEditableField,
  IUserReadonlyFields,
  IUserImmutableFields,
  UserSensitiveField,
  UserSystemField,
  UserComputedField,
  IUserRelationMap,
  IUserAsOneRelationConfig,
  IUserAsManyRelationConfig,
  IUserFilter,
  IUserItemQuery,
  IUserListQuery,
  IUserRelationQueries,
  IUserAsOneRelationQuery,
  IUserAsManyRelationQuery,
} from './user.types.tg';
