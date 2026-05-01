import { ESortOrder, ERelationType } from '../enums/shared';
// //////////////////////////////////////////////////////////////////////////////
//  PRIMITIVES
// //////////////////////////////////////////////////////////////////////////////

export type IDateRange = {
  from?: Date;
  to?: Date;
};

export type IRelationQueryValue<
  TRelatedEntity,
  TSelectableField extends keyof TRelatedEntity & string,
  TSortableField extends keyof TRelatedEntity & string,
> = IAsOneRelationQuery<TRelatedEntity, TSelectableField> | IAsManyRelationQuery<TRelatedEntity, TSelectableField, TSortableField>;

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERIES
// //////////////////////////////////////////////////////////////////////////////

/**
 * Base interface for relation query parameters that entities can extend.
 * Enforces that:
 * - only valid TRelationKey keys are allowed (no alien keys)
 * - each value is typed through its own generic chain
 * - TMap must cover exactly TRelationKey — no more, no less
 */
export type IBaseRelationQueries<TEntity, TRelationKey extends keyof TEntity, TMap extends Record<TRelationKey, unknown>> = {
  readonly [K in TRelationKey]?: TMap[K];
};

// //////////////////////////////////////////////////////////////////////////////
//  FILTER
// //////////////////////////////////////////////////////////////////////////////

/**
 * Filter shape for finding one or many records.
 *
 * Entity files should export their own filter type from this:
 *
 * export type IAppFilter = IBaseFilter<IApp, AppFilterableField>;
 */
export type IBaseFilter<TEntity, TFilterableField extends keyof TEntity> = Partial<Pick<TEntity, TFilterableField>>;

// //////////////////////////////////////////////////////////////////////////////
//  ITEM QUERY  (findById / findOne / detail)
// //////////////////////////////////////////////////////////////////////////////

/**
 * Query shape for fetching one item.
 *
 * Used by:
 * - findById
 * - findOne
 * - detail endpoints
 *
 * This controls the returned entity shape only.
 * It does not define filters.
 *
 * - TRelationQueries is mandatory — must be passed explicitly, no alien keys
 * - TInclude is bound to TRelationKey — can only include defined relations
 * - TFields is bound to TSelectableField — can only select defined fields
 */
export type IBaseItemQuery<
  TEntity,
  TRelationKey extends keyof TEntity,
  TSelectableField extends keyof TEntity & string,
  TInclude extends TRelationKey,
  TFields extends TSelectableField,
  TRelationMap extends Record<TRelationKey, unknown>,
  TRelationQueries extends IBaseRelationQueries<TEntity, TRelationKey, TRelationMap>,
> = TRelationQueries & {
  /** Relations to eager-load */
  include?: TInclude[];

  /** Fields to select from the main entity */
  fields?: TFields[];

  /** Include soft-deleted records */
  withDeleted?: boolean;
};

// //////////////////////////////////////////////////////////////////////////////
//  LIST QUERY
// //////////////////////////////////////////////////////////////////////////////

/**
 * Query shape for fetching a list.
 *
 * This controls:
 * - returned entity shape
 * - pagination
 * - sorting
 * - search
 * - date range filters
 *
 * Entity-specific filters should be composed separately via TFilter generic:
 *
 * export type IAppListQuery = IBaseListQuery<..., IAppFilter, IAppRelationQueries>;
 *
 * - TFilter is mandatory — must extend IBaseFilter, no alien filter keys
 * - TRelationQueries flows from IBaseItemQuery — no duplication, no leaks
 */
export type IBaseListQuery<
  TEntity,
  TRelationKey extends keyof TEntity,
  TSelectableField extends keyof TEntity & string,
  TSortableField extends keyof TEntity & string,
  TInclude extends TRelationKey,
  TFields extends TSelectableField,
  TSort extends TSortableField,
  TDateRangeField extends keyof TEntity & string,
  TFilter extends IBaseFilter<TEntity, keyof TEntity>,
  TRelationMap extends Record<TRelationKey, unknown>,
  TRelationQueries extends IBaseRelationQueries<TEntity, TRelationKey, TRelationMap>,
  TItemQuery extends IBaseItemQuery<TEntity, TRelationKey, TSelectableField, TInclude, TFields, TRelationMap, TRelationQueries>,
> = TItemQuery &
  TFilter & {
    /** Cursor for pagination */
    cursor?: string;

    /** Number of records to fetch after cursor */
    first?: number;

    /** Number of records to fetch before cursor */
    last?: number;

    /** Search term for configured searchable fields */
    q?: string;

    /** Fields to sort by */
    sortBy?: TSort[];

    /** Sort directions matching sortBy fields */
    sortOrder?: ESortOrder[];

    /** Date range fields allowed for range filtering */
    dateRange?: Partial<Record<TDateRangeField, IDateRange>>;
  };

// //////////////////////////////////////////////////////////////////////////////
//  INTERNAL QUERY TYPES
// //////////////////////////////////////////////////////////////////////////////

/**
 * Internal find options.
 *
 * Used for internal/system reads where public query DTO validation is bypassed,
 * while selected fields remain typed.
 */
export type InternalFindOptions<TEntity, TFields extends keyof TEntity & string> = {
  filters?: Partial<{ [K in keyof TEntity]: NonNullable<TEntity[K]> }>;
  take?: number;
  select?: TFields[];
};

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG TYPES — SERVER METADATA
// //////////////////////////////////////////////////////////////////////////////

/**
 * Server metadata for a ONE relation.
 */
export interface IOneRelationConfig<TRelationKey extends string, TSelectableField extends string> {
  /** Relation property key used by include and relation query params */
  relation: TRelationKey;

  /** Relation cardinality */
  type: ERelationType.One;

  /** All fields allowed to be selected from the related entity */
  selectableFields: readonly TSelectableField[];

  /** Default fields selected when relation fields are not provided */
  defaultSelectFields: readonly TSelectableField[];
}

/**
 * Server metadata for a MANY relation.
 */
export interface IManyRelationConfig<TRelationKey extends string, TSelectableField extends string, TSortableField extends string> {
  /** Relation property key used by include and relation query params */
  relation: TRelationKey;

  /** Relation cardinality */
  type: ERelationType.Many;

  /** All fields allowed to be selected from the related entity */
  selectableFields: readonly TSelectableField[];

  /** Default fields selected when relation fields are not provided */
  defaultSelectFields: readonly TSelectableField[];

  /** Fields allowed for sorting the related collection */
  sortableFields: readonly TSortableField[];

  /** Default relation collection limit */
  defaultLimit: number;

  /** Maximum relation collection limit */
  maxLimit: number;
}

// //////////////////////////////////////////////////////////////////////////////
//  RELATION CONFIG CUSTOM KEY HELPERS
// //////////////////////////////////////////////////////////////////////////////

/**
 * Creates a strict mapper for relation configs.
 *
 * This allows reusable target-entity relation configs to be reused
 * with a parent-specific relation key.
 */
export function createRelationKeyMapper<TParentRelationKey extends string>() {
  return {
    /**
     * Remaps a ONE relation config to a parent-safe relation key.
     */
    one: <TCustomKey extends TParentRelationKey, TSelectableField extends string>(
      config: IOneRelationConfig<string, TSelectableField>,
      customKey: TCustomKey,
    ): IOneRelationConfig<TCustomKey, TSelectableField> => ({
      ...config,
      relation: customKey,
    }),

    /**
     * Remaps a MANY relation config to a parent-safe relation key.
     */
    many: <TCustomKey extends TParentRelationKey, TSelectableField extends string, TSortableField extends string>(
      config: IManyRelationConfig<string, TSelectableField, TSortableField>,
      customKey: TCustomKey,
    ): IManyRelationConfig<TCustomKey, TSelectableField, TSortableField> => ({
      ...config,
      relation: customKey,
    }),
  };
}

// //////////////////////////////////////////////////////////////////////////////
//  RELATION QUERY PARAM TYPES — REQUEST CONTRACTS
// //////////////////////////////////////////////////////////////////////////////

/**
 * User-facing query params for a ONE relation.
 */
export interface IAsOneRelationQuery<TEntity, TSelectableField extends keyof TEntity & string> {
  /** Fields to select from the related entity */
  fields?: TSelectableField[];
}

/**
 * User-facing query params for a MANY relation.
 */
export type IAsManyRelationQuery<
  TEntity,
  TSelectableField extends keyof TEntity & string,
  TSortableField extends keyof TEntity & string,
  TAsOneQuery extends IAsOneRelationQuery<TEntity, TSelectableField> = IAsOneRelationQuery<TEntity, TSelectableField>,
> = TAsOneQuery & {
  /** Field to sort the related collection by */
  sortBy?: TSortableField[];

  /** Sort direction for the related collection */
  sortOrder?: ESortOrder[];

  /** Number of related records to skip */
  page?: number;

  /** Number of related records to return */
  limit?: number;
};

// //////////////////////////////////////////////////////////////////////////////
//  ENTITY QUERY / REPOSITORY CONFIG
// //////////////////////////////////////////////////////////////////////////////

/**
 * Central query capability config for an entity.
 *
 * This is server-side metadata used by repositories/services to validate:
 * - searchable fields
 * - selectable fields
 * - default selected fields
 * - sortable fields
 * - filterable fields
 * - date range fields
 * - one relations
 * - many relations
 */
export interface IEntityQueryOptions<
  TEntity,
  TSortableField extends keyof TEntity & string,
  TSelectableField extends keyof TEntity & string,
  TFilterableField extends keyof TEntity & string,
  TDateRangeField extends keyof TEntity & string,
  TRelationKey extends keyof TEntity & string,
  TOneRelationConfig extends readonly IOneRelationConfig<TRelationKey, string>[] = readonly [],
  TManyRelationConfig extends readonly IManyRelationConfig<TRelationKey, string, string>[] = readonly [],
> {
  /** Fields that support global fuzzy search through q */
  searchableFields: readonly (keyof TEntity & string)[];

  /** Fields clients are allowed to select */
  selectableFields: readonly TSelectableField[];

  /** Fields selected when no fields are provided */
  defaultSelectFields: readonly TSelectableField[];

  /** Fields clients are allowed to sort by */
  sortableFields: readonly TSortableField[];

  /** Fields clients are allowed to filter by exact value */
  filterFields: readonly TFilterableField[];

  /** Fields clients are allowed to filter by date range */
  dateRangeFields: readonly TDateRangeField[];

  /** Allowed ONE relation configs */
  oneRelations: TOneRelationConfig;

  /** Allowed MANY relation configs */
  manyRelations: TManyRelationConfig;
}
