export const QueryOperator = {
  exact: 'exact',
  search: 'search',
  in: 'in',
  range: 'range',
  exists: 'exists',

  // complex filter operators
  not: 'not',
  and: 'and',
  or: 'or',
  between: 'between',
  startsWith: 'starts_with',
  endsWith: 'ends_with',
  contains: 'contains',
  isNull: 'is_null',
  isNotNull: 'is_not_null',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
} as const;

export type QueryOperator = (typeof QueryOperator)[keyof typeof QueryOperator];

export interface PrimitiveQueryOptions {
  /**
   * Whether this primitive model field can be used in filters.
   *
   * If true and operators is empty, the compiler may infer safe defaults
   * based on the primitive type.
   */
  readonly filter?: boolean;

  /**
   * Filter operators supported by this primitive model field.
   */
  readonly operators?: readonly QueryOperator[];

  /**
   * Whether this field can be used in sort values.
   */
  readonly sort?: boolean;

  /**
   * Whether this field can be used in select values.
   */
  readonly select?: boolean;
}
