/**
 * Standardized Paginated Response
 * Extends base response with pagination and dynamic data keys.
 */
import { EAggregateType, AGGREGATE_PLURAL_MAP } from '../enums/shared';

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// repository
export interface IFindAllResponse<T> {
  data: T[];
  pageInfo: IPageInfo;
}

/**
 * Base Response Interface
 * Provides common structure for all API responses.
 */
export interface IBaseResponse {
  /** Operation status */
  success: boolean;

  /** Human-readable message */
  message: string;

  /** Technical metadata */
  meta: { timestamp: string; aggregateType: EAggregateType };
}

/**
 * Custom Data Response Interface
 * Provides a flexible structure for non-paginated responses.
 */
export type ICustomDataResponse<T> = IBaseResponse & {
  /** Response data with dynamic keys */
  [K in string as K extends keyof IBaseResponse ? never : K]: T;
};

/**
 * Dynamic Data Mapping
 * This enforces that if TKey is EAggregateType.TaxonomyNode,
 * the object MUST have a property called 'taxonomyNodes' using the plural mapping
 */
export type IPaginatedResponse<T, TKey extends EAggregateType, TOptions = unknown> = IBaseResponse & {
  [K in keyof typeof AGGREGATE_PLURAL_MAP as TKey extends K ? (typeof AGGREGATE_PLURAL_MAP)[K] : never]: T[];
} & {
  pageInfo: IPageInfo;
  options: TOptions;
};
