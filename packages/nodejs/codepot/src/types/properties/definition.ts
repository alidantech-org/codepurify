import { CompositeDefinition } from './composite/definition';
import { EnumDefinition } from './enum/definition';
import { PrimitiveDefinition } from './primitive/definition';

export interface PropertiesDefinition {
  primitives: Record<string, PrimitiveDefinition>;
  enums: Record<string, EnumDefinition>;
  composites: Record<string, CompositeDefinition>;
}

export type RefProperty = PrimitiveDefinition | EnumDefinition | CompositeDefinition;