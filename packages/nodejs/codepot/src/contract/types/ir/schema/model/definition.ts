// src/contract/types/compiled/schema/model/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { EntityDefinition } from '../entity/definition';
import type { EntityFieldDefinition } from '../entity/field/definition';

// ============================================================================
// MODEL FIELD
// ============================================================================

export interface ModelArrayFieldDefinition extends DefinitionItem {
  readonly type: 'array';
  readonly items: Ref<EntityFieldDefinition> | Ref<ModelDefinition>;
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export type ModelFieldDefinition = Ref<EntityFieldDefinition> | ModelArrayFieldDefinition;

// ============================================================================
// MODEL DEFINITION
// ============================================================================

export interface ModelDefinition extends DefinitionItem {
  readonly from: Ref<EntityDefinition>;

  /**
   * Preserve inheritance when the source entity extends another entity and the
   * parent has the same compiled model variant.
   */
  readonly extends?: Ref<ModelDefinition>;

  readonly partial?: boolean;

  /**
   * Compiled model fields only.
   * Inherited model fields should live on `extends`, not be duplicated here.
   */
  readonly fields: Record<string, ModelFieldDefinition>;
}
