// ============================================================================
// QUERY
// ============================================================================

import { RefProperty } from '../../../properties/definition';
import { Ref } from '../../../_shared/ref/definition';

export const QueryOperator = {
  eq: 'eq',
  neq: 'neq',
  in: 'in',
  notIn: 'notIn',
  contains: 'contains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  between: 'between',
  exists: 'exists',
} as const;

export type QueryOperator = (typeof QueryOperator)[keyof typeof QueryOperator];

export interface FieldQueryConfig {
  filter?: boolean;

  sort?: boolean;

  select?: boolean;

  operators?: QueryOperator[];

  meta: Record<string, unknown>;
}

// ============================================================================
// FIELD ACCESS
// ============================================================================

export const FieldAccessLevel = {
  public: 'public',
  internal: 'internal',
  secret: 'secret',
  auth: 'auth',
} as const;

export type FieldAccessLevel = (typeof FieldAccessLevel)[keyof typeof FieldAccessLevel];

export interface FieldAccessConfig {
  read?: FieldAccessLevel;

  write?: FieldAccessLevel;

  sensitive?: boolean;

  select?: boolean;

  meta: Record<string, unknown>;
}

// ============================================================================
// PERSISTENCE
// ============================================================================

export const FieldPersistenceMode = {
  stored: 'stored',
  virtual: 'virtual',
  computed: 'computed',
} as const;

export type FieldPersistenceMode = (typeof FieldPersistenceMode)[keyof typeof FieldPersistenceMode];

export interface FieldPersistenceConfig {
  mode: FieldPersistenceMode;

  generated?: boolean;

  immutable?: boolean;

  meta: Record<string, unknown>;
}

// ============================================================================
// ENTITY FIELDS
// ============================================================================

export interface EntityField {
  /**
   * Ref to a primitive, enum, or composite property.
   */
  ref: Ref<RefProperty>;

  description?: string;

  required?: boolean;

  nullable?: boolean;

  default?: unknown;

  query?: FieldQueryConfig;

  access?: FieldAccessConfig;

  persistence?: FieldPersistenceConfig;

  meta: Record<string, unknown>;
}
