// src/contract/types/ir/schema/model/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { EntityDefinition } from '../entity/definition';
import type { EntityFieldDefinition } from '../entity/field/definition';

// ============================================================================
// MODEL FIELD
// ============================================================================

export interface ModelArrayFieldDefinition extends DefinitionItem {
  type: 'array';
  items: Ref<EntityFieldDefinition> | Ref<ModelDefinition>;
  required?: boolean;
  nullable?: boolean;
}

export type ModelFieldDefinition = Ref<EntityFieldDefinition> | ModelArrayFieldDefinition;

// ============================================================================
// MODEL DEFINITION
// ============================================================================

export interface ModelDefinition extends DefinitionItem {
  from: Ref<EntityDefinition>;

  /**
   * Preserve inheritance when the source entity extends another entity and the
   * parent has the same compiled model variant.
   */
  extends?: Ref<ModelDefinition>;

  partial?: boolean;

  /**
   * Compiled model fields only.
   * Inherited model fields should live on `extends`, not be duplicated here.
   */
  fields: Record<string, ModelFieldDefinition>;
}
