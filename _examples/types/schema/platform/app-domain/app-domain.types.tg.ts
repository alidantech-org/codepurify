// //////////////////////////////////////////////////////////////////////////////
//  FIELD GROUPS
// //////////////////////////////////////////////////////////////////////////////

import * as Q from '../../../shared/query';
import * as T from './app-domain.types';
import * as TC from './app-domain.config';

// relations
import * as App from '../app/app.types';
import { IAppAsOneRelationQuery } from '../app/app.types.tg';

// //////////////////////////////////////////////////////////////////////////////
//  UNION TYPES FROM ARRAYS
// //////////////////////////////////////////////////////////////////////////////

export type AppDomainRelationKey = (typeof TC.APP_DOMAIN_FIELDS.relation.keys)[number];

export type IAppDomainContextualFields = (typeof TC.APP_DOMAIN_FIELDS.business.contextual)[number];

export type IAppDomainTransitionFields = (typeof TC.APP_DOMAIN_FIELDS.state.transition)[number];

export type IAppDomainToggleFields = (typeof TC.APP_DOMAIN_FIELDS.state.toggle)[number];

export type AppDomainSearchableField = (typeof TC.APP_DOMAIN_FIELDS.query.searchable)[number];

export type AppDomainFilterableField = (typeof TC.APP_DOMAIN_FIELDS.query.filterable)[number];

export type AppDomainDefaultSelectField = (typeof TC.APP_DOMAIN_FIELDS.query.defaultSelect)[number];

export type AppDomainSelectableField = (typeof TC.APP_DOMAIN_FIELDS.query.selectable)[number];

export type AppDomainSortableField = (typeof TC.APP_DOMAIN_FIELDS.query.sortable)[number];

export type AppDomainDateRangeField = (typeof TC.APP_DOMAIN_FIELDS.query.dateRange)[number];

export type AppDomainCreatableField = (typeof TC.APP_DOMAIN_FIELDS.mutation.creatable)[number];

export type AppDomainSystemCreatableField = (typeof TC.APP_DOMAIN_FIELDS.mutation.systemCreatable)[number];

export type AppDomainUpdatableField = (typeof TC.APP_DOMAIN_FIELDS.mutation.updatable)[number];

export type AppDomainEditableField = (typeof TC.APP_DOMAIN_FIELDS.mutation.editable)[number];

export type IAppDomainReadonlyFields = (typeof TC.APP_DOMAIN_FIELDS.mutation.readonly)[number];

export type IAppDomainImmutableFields = (typeof TC.APP_DOMAIN_FIELDS.mutation.immutable)[number];

export type AppDomainSensitiveField = (typeof TC.APP_DOMAIN_FIELDS.security.sensitive)[number];

export type AppDomainSystemField = (typeof TC.APP_DOMAIN_FIELDS.system.persisted)[number];

export type AppDomainComputedField = (typeof TC.APP_DOMAIN_FIELDS.system.computed)[number];

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERIES
// //////////////////////////////////////////////////////////////////////////////

export interface IAppDomainRelationMap extends Record<AppDomainRelationKey, unknown> {
  app: IAppAsOneRelationQuery;
}

export type AppDomainKey = keyof T.IAppDomain;

// //////////////////////////////////////////////////////////////////////////////
//  QUERY CONTRACTS
// //////////////////////////////////////////////////////////////////////////////

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppDomainAsOneRelationConfig = Q.IOneRelationConfig<'appDomain', AppDomainSelectableField>;

export type IAppDomainAsManyRelationConfig = Q.IManyRelationConfig<'appDomains', AppDomainSelectableField, AppDomainSortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  FILTER TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppDomainFilter = Q.IBaseFilter<T.IAppDomain, AppDomainFilterableField>;

export type IAppDomainItemQuery = Q.IBaseItemQuery<
  T.IAppDomain,
  AppDomainRelationKey,
  AppDomainSelectableField,
  AppDomainRelationKey,
  AppDomainSelectableField,
  IAppDomainRelationMap,
  IAppDomainRelationQueries
>;

export type IAppDomainListQuery = Q.IBaseListQuery<
  T.IAppDomain,
  AppDomainRelationKey,
  AppDomainSelectableField,
  AppDomainSortableField,
  AppDomainRelationKey,
  AppDomainSelectableField,
  AppDomainSortableField,
  AppDomainDateRangeField,
  IAppDomainFilter,
  IAppDomainRelationMap,
  IAppDomainRelationQueries,
  IAppDomainItemQuery
>;

export type IAppDomainRelationQueries = Q.IBaseRelationQueries<T.IAppDomain, AppDomainRelationKey, IAppDomainRelationMap>;

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERY TYPES
// //////////////////////////////////////////////////////////////////////////////

export type IAppDomainAsOneRelationQuery = Q.IAsOneRelationQuery<T.IAppDomain, AppDomainSelectableField>;

export type IAppDomainAsManyRelationQuery = Q.IAsManyRelationQuery<T.IAppDomain, AppDomainSelectableField, AppDomainSortableField>;
