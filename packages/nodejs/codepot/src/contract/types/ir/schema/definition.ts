// src/contract/types/compiled/schema/definition.ts

import type { DtoDefinition } from './dto/definition';
import type { EntityDefinition } from './entity/definition';
import type { EntityFieldDefinition } from './entity/field/definition';
import type { ModelDefinition } from './model/definition';
import type { ParamsDefinition } from './params/definition';
import type { FieldSetDefinition } from './field-set/definition';

// ============================================================================
// SCHEMAS
// ============================================================================

export interface SchemasDefinition {
  readonly entities: Record<string, EntityDefinition>;
  readonly field_sets: Record<string, FieldSetDefinition>;
  readonly models: Record<string, ModelDefinition>;
  readonly dtos: Record<string, DtoDefinition>;
  readonly params: ParamsDefinition;
}

export type RefSchema = EntityDefinition | EntityFieldDefinition | FieldSetDefinition | ModelDefinition | DtoDefinition;
