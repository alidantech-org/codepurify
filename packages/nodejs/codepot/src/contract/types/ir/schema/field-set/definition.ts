// src/contract/types/compiled/schema/field-set/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { EntityDefinition } from '../entity/definition';
import type { EntityFieldDefinition } from '../entity/field/definition';

// ============================================================================
// FIELD SET
// ============================================================================

export interface FieldSetDefinition extends DefinitionItem {
  readonly entity: Ref<EntityDefinition>;
  readonly fields: readonly Ref<EntityFieldDefinition>[];
}
