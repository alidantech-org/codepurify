import { CompositeDefinition } from './composite/definition';
import { EnumDefinition } from './enum/definition';
import { PrimitiveDefinition } from './primitive/definition';

/**
 * Reference to a property to be used when referencing a property
 */
export type RefProperty = PrimitiveDefinition | EnumDefinition | CompositeDefinition;

/**
 * Properties definition
 */
export interface PropertiesDefinition {
  /**
   * Primitive properties 
   */
  primitives: Record<string, PrimitiveDefinition>;
  
  /**
   * Enum properties 
   */
  enums: Record<string, EnumDefinition>;
  
  /**
   * Composite properties 
   */
  composites: Record<string, CompositeDefinition>;
}

