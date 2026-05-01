// //////////////////////////////////////////////////////////////////////////////
//  FIELD GROUPS
// //////////////////////////////////////////////////////////////////////////////

import * as Q from '../../../shared/query';
import * as T from './app-api-key.types';
import * as TC from './app-api-key.config';

// relations
import * as App from '../app/app.types';

// app relation types
import { AppRelationKey, IAppAsOneRelationQuery, IAppRelationMap } from '../app/app.types.tg';
import { IApp } from '../app/app.types';

// //////////////////////////////////////////////////////////////////////////////
//  UNION TYPES FROM ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export type AppApiKeyRelationKey = (typeof TC.APP_API_KEY_FIELDS.relation.keys)[number];

export type IAppApiKeyContextualFields = (typeof TC.APP_API_KEY_FIELDS.business.contextual)[number];

export type IAppApiKeyTransitionFields = (typeof TC.APP_API_KEY_FIELDS.state.transition)[number];

export type IAppApiKeyToggleFields = (typeof TC.APP_API_KEY_FIELDS.state.toggle)[number];

export type AppApiKeySearchableField = (typeof TC.APP_API_KEY_FIELDS.query.searchable)[number];

export type AppApiKeyFilterableField = (typeof TC.APP_API_KEY_FIELDS.query.filterable)[number];

export type AppApiKeyDefaultSelectField = (typeof TC.APP_API_KEY_FIELDS.query.defaultSelect)[number];

export type AppApiKeySelectableField = (typeof TC.APP_API_KEY_FIELDS.query.selectable)[number];

export type AppApiKeySortableField = (typeof TC.APP_API_KEY_FIELDS.query.sortable)[number];

export type AppApiKeyDateRangeField = (typeof TC.APP_API_KEY_FIELDS.query.dateRange)[number];

export type AppApiKeyCreatableField = (typeof TC.APP_API_KEY_FIELDS.mutation.creatable)[number];

export type AppApiKeySystemCreatableField = (typeof TC.APP_API_KEY_FIELDS.mutation.systemCreatable)[number];

export type AppApiKeyUpdatableField = (typeof TC.APP_API_KEY_FIELDS.mutation.updatable)[number];

export type AppApiKeyEditableField = (typeof TC.APP_API_KEY_FIELDS.mutation.editable)[number];

export type IAppApiKeyReadonlyFields = (typeof TC.APP_API_KEY_FIELDS.mutation.readonly)[number];

export type IAppApiKeyImmutableFields = (typeof TC.APP_API_KEY_FIELDS.mutation.immutable)[number];

export type AppApiKeySensitiveField = (typeof TC.APP_API_KEY_FIELDS.security.sensitive)[number];

export type AppApiKeySystemField = (typeof TC.APP_API_KEY_FIELDS.system.persisted)[number];

export type AppApiKeyComputedField = (typeof TC.APP_API_KEY_FIELDS.system.computed)[number];

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERIES
// //////////////////////////////////////////////////////////////////////////////

export interface IAppApiKeyRelationMap extends Record<AppApiKeyRelationKey, unknown> {
  app: IAppAsOneRelationQuery;
}

export type AppApiKeyKey = keyof T.IAppApiKey;

// //////////////////////////////////////////////////////////////////////////////
//  QUERY CONTRACTS
// //////////////////////////////////////////////////////////////////////////////

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppApiKeyAsOneRelationConfig = Q.IOneRelationConfig<'appApiKey', AppApiKeySelectableField>;

export type IAppApiKeyAsManyRelationConfig = Q.IManyRelationConfig<'appApiKeys', AppApiKeySelectableField, AppApiKeySortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  FILTER TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppApiKeyFilter = Q.IBaseFilter<T.IAppApiKey, AppApiKeyFilterableField>;

export type IAppApiKeyItemQuery = Q.IBaseItemQuery<
  T.IAppApiKey,
  AppApiKeyRelationKey,
  AppApiKeySelectableField,
  AppApiKeyRelationKey,
  AppApiKeySelectableField,
  IAppApiKeyRelationMap,
  IAppApiKeyRelationQueries
>;

export type IAppApiKeyListQuery = Q.IBaseListQuery<
  T.IAppApiKey,
  AppApiKeyRelationKey,
  AppApiKeySelectableField,
  AppApiKeySortableField,
  AppApiKeyRelationKey,
  AppApiKeySelectableField,
  AppApiKeySortableField,
  AppApiKeyDateRangeField,
  IAppApiKeyFilter,
  IAppApiKeyRelationMap,
  IAppRelationQueries,
  IAppApiKeyItemQuery
>;

export type IAppApiKeyRelationQueries = Q.IBaseRelationQueries<T.IAppApiKey, AppApiKeyRelationKey, IAppApiKeyRelationMap>;

export type IAppRelationQueries = Q.IBaseRelationQueries<IApp, AppRelationKey, IAppRelationMap>;

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERY TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppApiKeyAsOneRelationQuery = Q.IAsOneRelationQuery<T.IAppApiKey, AppApiKeySelectableField>;

export type IAppApiKeyAsManyRelationQuery = Q.IAsManyRelationQuery<T.IAppApiKey, AppApiKeySelectableField, AppApiKeySortableField>;
