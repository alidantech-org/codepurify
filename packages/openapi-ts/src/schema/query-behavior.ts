export const QueryBehavior = {
  exact: 'exact',
  search: 'search',
  exactSearch: 'exact_search',
  range: 'range',
  in: 'in',
  exists: 'exists',
  select: 'select',
} as const;

export type QueryBehavior = (typeof QueryBehavior)[keyof typeof QueryBehavior];

export interface PrimitiveQueryOptions {
  readonly methods?: readonly QueryBehavior[];
  readonly sort?: boolean;
}
