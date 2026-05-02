// ─── codepurify/fields/entity.ts ─────────────────────────────────────────────────

import { FieldConfig, RelationConfigUnion, IndexConfig, IEntityConfig } from '../types';

// ─── Helper functions for entity configurations ───────────────────────────────────

export function defineFields<T extends Record<string, FieldConfig>>(fields: T): T {
  return fields;
}

export function defineRelations<const T extends Record<string, RelationConfigUnion>>(relations: T): T {
  return relations;
}

export function defineIndexes<const T extends readonly IndexConfig[]>(indexes: T): T {
  return indexes;
}

// ─── Entity definition ────────────────────────────────────────────────────────

export declare function defineEntityConfig<T extends IEntityConfig>(config: (self: T) => T): T;
