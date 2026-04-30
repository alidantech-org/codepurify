import { TSchema } from '../enums/shared';

// Index type definitions for type-safe index arrays
export interface IndexDefinition<T extends string> {
  fields: T[]; // Array of field names to index
  unique?: boolean; // Whether the index should be unique
}

export const Typekeys =
  <TKey extends PropertyKey>() =>
  <const TFields extends readonly TKey[]>(fields: TFields) =>
    fields;

// Array of index definitions
export type IndexArray<T extends string> = readonly IndexDefinition<T>[];

// Helper type to extract field names from an entity interface
export type EntityFieldNames<T> = Extract<keyof T, string>;

// Database field configuration types
export type DBFieldType = 'varchar' | 'text' | 'uuid' | 'boolean' | 'integer' | 'decimal' | 'timestamp' | 'json' | 'simple-enum';

// Configuration for a single database field
export interface DBFieldConfig<V = any> {
  type: DBFieldType; // Database column type
  name: string; // Database column name
  nullable?: boolean; // Whether field can be null
  default?: V; // Default value for field
  length?: number; // Length for varchar fields
  precision?: number; // Precision for decimal fields
  scale?: number; // Scale for decimal fields
}

// Helper types to distinguish scalar fields from relations

// Extracts scalar (non-relation) keys from an entity type
// Scalar fields are stored directly in the database table
export type ScalarKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends unknown[]
    ? never // Exclude arrays (many-to-many relations)
    : NonNullable<T[K]> extends Record<string, any>
      ? NonNullable<T[K]> extends Date
        ? K // Include dates as scalar
        : NonNullable<T[K]> extends { readonly [key: string]: any }
          ? never // Exclude readonly objects (one-to-one relations)
          : K // Include mutable objects (JSON fields)
      : K; // Include all other scalar types
}[keyof T];

// Extracts keys that represent many-to-many relations (arrays)
export type ManyRelationKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends unknown[] ? K : never;
}[keyof T] &
  string;

// Extracts keys that represent one-to-one relations (objects)
export type OneRelationKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends unknown[] ? never : NonNullable<T[K]> extends object ? K : never;
}[keyof T] &
  string;

// Extracts scalar fields that can be indexed (excluding base fields)
export type IndexableFields<T, OBase extends keyof T> = Extract<ScalarKeys<Omit<T, OBase>>, string>;

// Database configuration for entity fields (excluding base fields)
// Maps field names to their database configurations
export type EntityDBConfig<T, OBase extends keyof T> = {
  [K in Exclude<ScalarKeys<T>, OBase>]: DBFieldConfig;
};

// Configuration for one-to-one relations
export interface OneRelationConfig {
  entity: string; // Target entity name
  alias?: string; // Optional alias for the relation
  joinColumn: string; // Foreign key column name
  onDelete: 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'RESTRICT'; // Delete behavior
  module?: TSchema; // Optional module/schema
}

// Configuration for many-to-many relations
export interface ManyRelationConfig {
  entity: string; // Target entity name
  alias?: string; // Optional alias for the relation
  key: string; // Join table key name
  cascade: 'none' | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[] | 'true' | 'false'; // Cascade behavior
  module?: TSchema; // Optional module/schema
}

// Configuration for all relations of an entity
export type EntityRelationsConfig<T> = {
  oneRelations?: { [K in OneRelationKeys<T>]?: OneRelationConfig }; // One-to-one relations
  manyRelations?: { [K in ManyRelationKeys<T>]?: ManyRelationConfig }; // Many-to-many relations
};
