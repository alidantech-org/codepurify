// src/contract/types/compiled/properties/definition.ts

import type { PrimitiveDefinition } from './primitive/definition';
import type { EnumDefinition } from './enum/definition';
import type { CompositeDefinition } from './composite/definition';

// ============================================================================
// PROPERTY REFS
// ============================================================================

export type RefProperty = PrimitiveDefinition | EnumDefinition | CompositeDefinition;

// ============================================================================
// PROPERTIES DEFINITION
// ============================================================================

export interface PropertiesDefinition {
  readonly primitives: Record<string, PrimitiveDefinition>;
  readonly enums: Record<string, EnumDefinition>;
  readonly composites: Record<string, CompositeDefinition>;
}
