import { PrimitiveDefinition } from '../../properties/primitive/definition';
import { Ref } from '../../_shared/ref/definition';
import { DefinitionItem } from '../../definition';

export interface ParamsDefinition extends DefinitionItem {
  /**
   * Reference to the primitive definition.
   */
  ref: Ref<PrimitiveDefinition>;

  /**
   * Whether this parameter is required.
   */
  required?: boolean;
}
