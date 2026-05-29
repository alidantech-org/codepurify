// ============================================================================
// QUERY
// ============================================================================

import { Ref } from '../../../ref/definition';

export type QueryOperator =
  | 'eq'
  | 'neq'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'exists';

export interface FieldQueryConfig {
  filter?: boolean;

  sort?: boolean;

  select?: boolean;

  operators?: QueryOperator[];

  defaultOperator?: QueryOperator;
}

// ============================================================================
// ACCESS
// ============================================================================

export type AccessLevel = 'public' | 'restricted' | 'secret';

export interface FieldAccessConfig {
  read?: AccessLevel;

  write?: AccessLevel;

  roles?: Ref[];

  metadata?: Record<string, unknown>;
}

export interface AccessDefinition {
  public?: boolean;

  roles?: Ref[];

  policies?: Ref[];

  metadata?: Record<string, unknown>;
}

// ============================================================================
// PERSISTENCE
// ============================================================================

export interface FieldPersistenceConfig {
  unique?: boolean;

  index?: boolean;

  sparse?: boolean;

  searchable?: boolean;

  generated?: boolean;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export interface FieldSerializationConfig {
  expose?: boolean;

  deprecated?: boolean;

  name?: string;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// RELATIONS
// ============================================================================

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

export interface FieldRelationConfig {
  type: RelationType;

  entity: Ref;

  inverse?: string;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// ENTITY FIELDS
// ============================================================================

export interface EntityField {
  ref: Ref;

  description?: string;

  required?: boolean;

  nullable?: boolean;

  default?: unknown;

  query?: FieldQueryConfig;

  access?: FieldAccessConfig;

  persistence?: FieldPersistenceConfig;

  serialization?: FieldSerializationConfig;

  relation?: FieldRelationConfig;

  metadata?: Record<string, unknown>;
}
