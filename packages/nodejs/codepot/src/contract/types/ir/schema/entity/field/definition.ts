// src/contract/types/compiled/schema/entity/field/definition.ts

import type { DefinitionItem } from '../../../definition';
import type { Ref } from '../../../ref';
import type { RefProperty } from '../../../properties/definition';
import type { EntityDefinition } from '../definition';

// ============================================================================
// CAPABILITY
// ============================================================================

export const QueryOperator = {
  eq: 'eq',
  neq: 'neq',
  in: 'in',
  not_in: 'not_in',
  contains: 'contains',
  starts_with: 'starts_with',
  ends_with: 'ends_with',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  between: 'between',
  exists: 'exists',
} as const;

export type QueryOperator = (typeof QueryOperator)[keyof typeof QueryOperator];

export interface FieldCapabilityConfig extends DefinitionItem {
  readonly filter?: boolean;
  readonly sort?: boolean;
  readonly select?: boolean;
  readonly operators?: readonly QueryOperator[];
}

// ============================================================================
// VISIBILITY
// ============================================================================

export const FieldVisibilityLevel = {
  public: 'public',
  internal: 'internal',
  secret: 'secret',
  auth: 'auth',
} as const;

export type FieldVisibilityLevel = (typeof FieldVisibilityLevel)[keyof typeof FieldVisibilityLevel];

export interface FieldVisibilityConfig extends DefinitionItem {
  readonly read?: FieldVisibilityLevel;
  readonly write?: FieldVisibilityLevel;
  readonly sensitive?: boolean;
}

// ============================================================================
// LIFECYCLE
// ============================================================================

export interface FieldLifecycleConfig extends DefinitionItem {
  readonly create?: boolean;
  readonly update?: boolean;
  readonly immutable?: boolean;
  readonly generated?: boolean;
  readonly read_only?: boolean;
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
  readonly mode: FieldPersistenceMode;
  readonly generated?: boolean;
  readonly immutable?: boolean;
}

// ============================================================================
// ARRAY
// ============================================================================

export interface ArrayDefinition extends DefinitionItem {
  readonly min_items?: number;
  readonly max_items?: number;
  readonly unique_items?: boolean;
}

// ============================================================================
// RELATION
// ============================================================================

export const EntityRelationKind = {
  belongs_to: 'belongs_to',
  has_one: 'has_one',
  has_many: 'has_many',
  many_to_many: 'many_to_many',
} as const;

export type EntityRelationKind = (typeof EntityRelationKind)[keyof typeof EntityRelationKind];

export interface EntityRelationThroughDefinition {
  readonly entity: Ref<EntityDefinition>;
  readonly from: Ref<EntityFieldDefinition>;
  readonly to: Ref<EntityFieldDefinition>;
}

export interface EntityRelationDefinition {
  readonly relation: EntityRelationKind;
  readonly target: Ref<EntityDefinition>;
  readonly inverse?: Ref<EntityFieldDefinition>;
  readonly through?: EntityRelationThroughDefinition;
}

// ============================================================================
// FIELD OPTIONS
// ============================================================================

export interface EntityFieldOptionsDefinition extends DefinitionItem {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly array?: true | ArrayDefinition;
  readonly default?: unknown;

  readonly capability?: FieldCapabilityConfig;
  readonly visibility?: FieldVisibilityConfig;
  readonly lifecycle?: FieldLifecycleConfig;
  readonly persistence?: FieldPersistenceConfig;
}

// ============================================================================
// ENTITY FIELD
// ============================================================================

export type EntityPropertyFieldDefinition = Ref<RefProperty> & EntityFieldOptionsDefinition;

export type EntityRelationFieldDefinition = EntityRelationDefinition & EntityFieldOptionsDefinition;

export type EntityFieldDefinition = EntityPropertyFieldDefinition | EntityRelationFieldDefinition;
