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

  metadata?: Record<string, unknown>;
}

// ============================================================================
// FIELD ACCESS
// ============================================================================

export type FieldAccessLevel = 'public' | 'internal' | 'secret';

export interface FieldAccessConfig {
  /**
   * Controls whether this field can be exposed in generated output models.
   */
  read?: FieldAccessLevel;

  /**
   * Controls whether this field can appear in generated input/write models.
   */
  write?: FieldAccessLevel;

  /**
   * Shortcut for highly sensitive fields like password/token/secret.
   */
  sensitive?: boolean;

  /**
   * Whether this field is selected by default from persistence.
   */
  select?: boolean;

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

  immutable?: boolean;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export interface FieldSerializationConfig {
  expose?: boolean;

  deprecated?: boolean;

  /**
   * Serialized field name override.
   * Example: database field "created_at" -> JSON field "createdAt".
   */
  name?: string;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// RELATIONS
// ============================================================================

export type RelationType = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

export interface FieldRelationConfig<TEntity = unknown, TResource = unknown, TField = unknown> {
  type: RelationType;

  /**
   * Target entity this field relates to.
   */
  entity: Ref<TEntity>;

  /**
   * Optional resource owner for the related entity.
   */
  resource?: Ref<TResource>;

  /**
   * Target field on the related entity.
   * Usually the target entity id field.
   */
  targetField?: Ref<TField>;

  /**
   * Whether this field owns the foreign key.
   */
  owner?: boolean;

  /**
   * Optional inverse relation name on the target entity.
   */
  inverse?: string;

  metadata?: Record<string, unknown>;
}

// ============================================================================
// ENTITY FIELDS
// ============================================================================

export interface EntityField<TProperty = unknown, TEntity = unknown, TResource = unknown, TRelationField = unknown> {
  /**
   * Ref to a primitive, enum, or composite property.
   */
  ref: Ref<TProperty>;

  description?: string;

  required?: boolean;

  nullable?: boolean;

  default?: unknown;

  query?: FieldQueryConfig;

  access?: FieldAccessConfig;

  persistence?: FieldPersistenceConfig;

  serialization?: FieldSerializationConfig;

  relation?: FieldRelationConfig<TEntity, TResource, TRelationField>;

  metadata?: Record<string, unknown>;
}
