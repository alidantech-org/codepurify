// ============================================================================
// QUERY
// ============================================================================

import { RefProperty } from '../../../properties/definition';
import { Ref, RefUsageDefinition, ArrayUsageDefinition } from '../../../ref';
import { DefinitionItem } from '../../../definition';

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

export interface FieldQueryConfig extends DefinitionItem {
  filter?: boolean;

  sort?: boolean;

  select?: boolean;

  operators?: readonly QueryOperator[];
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

export interface FieldAccessConfig extends DefinitionItem {
  read?: FieldAccessLevel;

  write?: FieldAccessLevel;

  sensitive?: boolean;
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

export interface FieldPersistenceConfig extends DefinitionItem {
  mode: FieldPersistenceMode;

  generated?: boolean;

  immutable?: boolean;
}

// ============================================================================
// ENTITY FIELDS
// ============================================================================

export interface EntityField extends DefinitionItem {
  /**
   * Usage of a primitive, enum, or composite property.
   *
   * The referenced property definition remains single.
   * This field decides whether it is used as single or array.
   */
  type: {
    readonly $ref: string;
    readonly array?: true | ArrayUsageDefinition;
    readonly description?: string;
    readonly deprecated?: boolean;
    readonly meta?: Record<string, unknown>;
  };

  required?: boolean;

  nullable?: boolean;

  default?: unknown;

  query?: FieldQueryConfig;

  access?: FieldAccessConfig;

  persistence?: FieldPersistenceConfig;
}
