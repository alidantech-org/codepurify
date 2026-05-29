import { Ref } from '../../_shared/ref/definition';
import { RefProperty } from '../definition';
import { DefinitionItem } from '../../definition';
import { EntityDefinition } from '../../schema/entity/definition';
import { ResourceDefinition } from '../../resource/definition';

export interface CompositeDefinition extends DefinitionItem {
  /**
   * Real composite inheritance/extension.
   * One parent max to keep merging predictable.
   */
  extends?: Ref<CompositeDefinition>;

  /**
   * Composite-owned reusable property refs.
   */
  properties: Record<string, Ref<RefProperty>>;

  /**
   * Reference to the resource that owns this enum
   */
  resource?: Ref<ResourceDefinition>;

  /**
   * Reference to the entity that owns this enum
   */
  entity?: Ref<EntityDefinition>;
}
