/**

 * SHARED SCHEMA ENUMS

 * Common enums used across the platform

 */

import { ECoreTable } from './core';

import { EGeoTable } from './geo';

import { ECommerceTable } from './commerce';

import { EBusinessTable } from './business';

import { EAnalyticsTable } from './analytics';

import { EInteractionTable } from './interaction';

import { EMediaTable } from './media';

import { EContentTable } from './content';

import { EAuthTable } from './auth';
import { EPlatformTable } from './platform';

/**

 * Database schema names for namespacing

 */

export enum ESchema {
  Auth = 'auth',

  Core = 'core',

  Geo = 'geo',

  Commerce = 'commerce',

  Business = 'business',

  Analytics = 'analytics',

  Interaction = 'interaction',

  Media = 'media',

  Content = 'content',

  Platform = 'platform',
}

export type TSchema = `${ESchema}`;

export type TTableName =
  | `${ECoreTable}`
  | `${EAuthTable}`
  | `${EGeoTable}`
  | `${ECommerceTable}`
  | `${EBusinessTable}`
  | `${EAnalyticsTable}`
  | `${EInteractionTable}`
  | `${EMediaTable}`
  | `${EContentTable}`
  | `${EPlatformTable}`;

/**

 * Sort order directions for query results

 */

export enum ESortOrder {
  Asc = 'asc',

  Desc = 'desc',
}

/**

 * Relation types for entity relationships

 */

export enum ERelationType {
  One = 'one',

  Many = 'many',
}

/**

 * Aggregate Root Types

 * Identifies the main entity aggregates in the domain model

 * Used for event sourcing, caching, and domain boundaries

 */

export enum EAggregateType {
  // Core aggregates - semantic structure

  TaxonomyNode = `${ESchema.Core}.${ECoreTable.TaxonomyNodes}`,

  TaxonomyRelation = `${ESchema.Core}.${ECoreTable.TaxonomyRelations}`,

  Alias = `${ESchema.Core}.${ECoreTable.Aliases}`,

  // Geo aggregates - location and language

  Locality = `${ESchema.Geo}.${EGeoTable.Localities}`,

  Language = `${ESchema.Geo}.${EGeoTable.Languages}`,

  // Commerce aggregates - measurement and pricing

  MeasurementUnit = `${ESchema.Commerce}.${ECommerceTable.MeasurementUnits}`,

  // Analytics aggregates - tracking and insights

  SearchLog = `${ESchema.Analytics}.${EAnalyticsTable.SearchLogs}`,

  AliasSuggestion = `${ESchema.Analytics}.${EAnalyticsTable.AliasSuggestions}`,

  BusinessEventLog = `${ESchema.Analytics}.${EAnalyticsTable.BusinessEventLogs}`,

  // Business aggregates - main business entities

  Business = `${ESchema.Business}.${EBusinessTable.Businesses}`,

  BusinessProduct = `${ESchema.Business}.${EBusinessTable.BusinessProducts}`,

  BusinessService = `${ESchema.Business}.${EBusinessTable.BusinessServices}`,

  // Interaction aggregates - user interactions

  SoftOrder = `${ESchema.Interaction}.${EInteractionTable.SoftOrders}`,

  Booking = `${ESchema.Interaction}.${EInteractionTable.Bookings}`,

  Reservation = `${ESchema.Interaction}.${EInteractionTable.Reservations}`,

  QuoteRequest = `${ESchema.Interaction}.${EInteractionTable.QuoteRequests}`,

  Review = `${ESchema.Interaction}.${EInteractionTable.Reviews}`,

  // Media aggregates - media management

  TaxonomyMedia = `${ESchema.Media}.${EMediaTable.TaxonomyMedia}`,

  BusinessMedia = `${ESchema.Media}.${EMediaTable.BusinessMedia}`,

  // Content aggregates - UI content management

  UiKey = `${ESchema.Content}.${EContentTable.UiKeys}`,

  UiTranslation = `${ESchema.Content}.${EContentTable.UiTranslations}`,

  UiContextLabel = `${ESchema.Content}.${EContentTable.UiContextLabels}`,
}

export const AGGREGATE_PLURAL_MAP = {
  // Core aggregates

  [EAggregateType.TaxonomyNode]: 'taxonomyNodes',

  [EAggregateType.TaxonomyRelation]: 'taxonomyRelations',

  [EAggregateType.Alias]: 'aliases',

  // Geo aggregates

  [EAggregateType.Locality]: 'localities',

  [EAggregateType.Language]: 'languages',

  // Commerce aggregates

  [EAggregateType.MeasurementUnit]: 'measurementUnits',

  // Analytics aggregates

  [EAggregateType.SearchLog]: 'searchLogs',

  [EAggregateType.AliasSuggestion]: 'aliasSuggestions',

  [EAggregateType.BusinessEventLog]: 'businessEventLogs',

  // Business aggregates

  [EAggregateType.Business]: 'businesses',

  [EAggregateType.BusinessProduct]: 'businessProducts',

  [EAggregateType.BusinessService]: 'businessServices',

  // Interaction aggregates

  [EAggregateType.SoftOrder]: 'softOrders',

  [EAggregateType.Booking]: 'bookings',

  [EAggregateType.Reservation]: 'reservations',

  [EAggregateType.QuoteRequest]: 'quoteRequests',

  [EAggregateType.Review]: 'reviews',

  // Media aggregates

  [EAggregateType.TaxonomyMedia]: 'taxonomyMedia',

  [EAggregateType.BusinessMedia]: 'businessMedia',

  // Content aggregates

  [EAggregateType.UiKey]: 'uiKeys',

  [EAggregateType.UiTranslation]: 'uiTranslations',

  [EAggregateType.UiContextLabel]: 'uiContextLabels',
} as const;

/**

 * Type for aggregate plural map values

 */

export type AggregatePluralMapValue = (typeof AGGREGATE_PLURAL_MAP)[keyof typeof AGGREGATE_PLURAL_MAP];

/**

 * Type-safe function to get plural key from aggregate type

 * This eliminates the need for 'as' casts in services

 */

export function getAggregatePluralKey(aggregateType: EAggregateType): AggregatePluralMapValue {
  return AGGREGATE_PLURAL_MAP[aggregateType as keyof typeof AGGREGATE_PLURAL_MAP];
}
