import { DefinitionItem } from '../../definition';
import { Ref } from '../../_shared/ref/definition';
import { ResourceDefinition } from '../../resource/definition';
import { EntityDefinition } from '../../schema/entity/definition';

export type EnumValuePrimitive = string | number;

export interface EnumValueDefinition extends DefinitionItem {
  /**
   * The actual value of the enum
   */
  value: EnumValuePrimitive;

  /**
   * Human-readable label for the enum value
   */
  label?: string;
}

export interface EnumDefinition extends DefinitionItem {
  /**
   * Map of enum values
   */
  values: Record<string, EnumValueDefinition>;

  /**
   * Reference to the resource that owns this enum
   */
  resource?: Ref<ResourceDefinition>;

  /**
   * Reference to the entity that owns this enum
   */
  entity?: Ref<EntityDefinition>;
}
