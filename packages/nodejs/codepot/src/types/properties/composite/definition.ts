import { Ref } from '../../_shared/ref/definition';
import { RefProperty } from '../definition';
import { DefinitionItem } from '../../definition';

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
}
