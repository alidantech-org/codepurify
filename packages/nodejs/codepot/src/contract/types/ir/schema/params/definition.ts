// src/contract/types/ir/schema/params/definition.ts

import type { Ref } from '../../ref';
import type { EntityFieldDefinition } from '../entity/field/definition';

// ============================================================================
// PARAMS
// ============================================================================

export type ParamDefinition = Ref<EntityFieldDefinition>;

export type ParamsDefinition = Record<string, ParamDefinition>;
