// //////////////////////////////////////////////////////////////////////////////
//  FIELD GROUPS
// //////////////////////////////////////////////////////////////////////////////

import * as Q from '../../../shared/query';
import * as T from './app.types';
import * as TC from './app.config';

// relations
import * as ApiKey from '../app-api-key';
import * as Domain from '../app-domain';

// relation types
import { AppApiKeyRelationKey } from '../app-api-key';

// //////////////////////////////////////////////////////////////////////////////
//  UNION TYPES FROM ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export type AppRelationKey = (typeof TC.APP_FIELDS.relation.keys)[number];

export type IAppContextualFields = (typeof TC.APP_FIELDS.business.contextual)[number];

export type IAppTransitionFields = (typeof TC.APP_FIELDS.state.transition)[number];

export type IAppToggleFields = (typeof TC.APP_FIELDS.state.toggle)[number];

export type AppSearchableField = (typeof TC.APP_FIELDS.query.searchable)[number];

export type AppFilterableField = (typeof TC.APP_FIELDS.query.filterable)[number];

export type AppDefaultSelectField = (typeof TC.APP_FIELDS.query.defaultSelect)[number];

export type AppSelectableField = (typeof TC.APP_FIELDS.query.selectable)[number];

export type AppSortableField = (typeof TC.APP_FIELDS.query.sortable)[number];

export type AppDateRangeField = (typeof TC.APP_FIELDS.query.dateRange)[number];

export type AppCreatableField = (typeof TC.APP_FIELDS.mutation.creatable)[number];

export type AppSystemCreatableField = (typeof TC.APP_FIELDS.mutation.systemCreatable)[number];

export type AppUpdatableField = (typeof TC.APP_FIELDS.mutation.updatable)[number];

export type AppEditableField = (typeof TC.APP_FIELDS.mutation.editable)[number];

export type IAppReadonlyFields = (typeof TC.APP_FIELDS.mutation.readonly)[number];

export type IAppImmutableFields = (typeof TC.APP_FIELDS.mutation.immutable)[number];

export type AppSensitiveField = (typeof TC.APP_FIELDS.security.sensitive)[number];

export type AppSystemField = (typeof TC.APP_FIELDS.system.persisted)[number];

export type AppComputedField = (typeof TC.APP_FIELDS.system.computed)[number];

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERIES
// //////////////////////////////////////////////////////////////////////////////

export interface IAppRelationMap extends Record<AppRelationKey, unknown> {
  apiKeys: ApiKey.IAppApiKeyAsManyRelationQuery;
  domains: Domain.IAppDomainAsManyRelationQuery;
}

export type AppKey = keyof T.IApp;

// //////////////////////////////////////////////////////////////////////////////
//  QUERY CONTRACTS
// //////////////////////////////////////////////////////////////////////////////

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppAsOneRelationConfig = Q.IOneRelationConfig<'app', AppSelectableField>;

export type IAppAsManyRelationConfig = Q.IManyRelationConfig<'apps', AppSelectableField, AppSortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  FILTER TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppFilter = Q.IBaseFilter<T.IApp, AppFilterableField>;

export type IAppItemQuery = Q.IBaseItemQuery<
  T.IApp,
  AppRelationKey,
  AppSelectableField,
  AppRelationKey,
  AppSelectableField,
  IAppRelationMap,
  IAppRelationQueries
>;

export type IAppListQuery = Q.IBaseListQuery<
  T.IApp,
  AppRelationKey,
  AppSelectableField,
  AppSortableField,
  AppRelationKey,
  AppSelectableField,
  AppSortableField,
  AppDateRangeField,
  IAppFilter,
  IAppRelationMap,
  IAppRelationQueries,
  IAppItemQuery
>;

export type IAppRelationQueries = Q.IBaseRelationQueries<T.IApp, AppRelationKey, IAppRelationMap>;

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERY TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppAsOneRelationQuery = Q.IAsOneRelationQuery<T.IApp, AppSelectableField>;

export type IAppAsManyRelationQuery = Q.IAsManyRelationQuery<T.IApp, AppSelectableField, AppSortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  EXTERNAL RELATION MAPS
// //////////////////////////////////////////////////////////////////////////////

export interface IAppApiKeyRelationMap extends Record<AppApiKeyRelationKey, unknown> {
  app: IAppAsOneRelationQuery;
}
