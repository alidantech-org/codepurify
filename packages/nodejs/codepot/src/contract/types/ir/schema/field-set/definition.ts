// src/contract/types/ir/schema/field-set/definition.ts

import type { Ref } from '../../ref';
import type { EntityFieldDefinition } from '../entity/field/definition';

// ============================================================================
// FIELD SET
// ============================================================================

export type FieldSetDefinition = readonly Ref<EntityFieldDefinition>[];
