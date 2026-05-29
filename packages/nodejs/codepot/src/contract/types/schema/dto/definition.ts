import { RefProperty } from '../../properties/definition';
import { Ref } from '../../ref';
import { ModelDefinition } from '../model/definition';
import { DefinitionItem } from '../../definition';

export interface DtoDefinition extends DefinitionItem {
  /**
   * Optional inheritance from a model or another DTO.
   * If omitted, the DTO is standalone.
   */
  extends?: Ref<ModelDefinition | DtoDefinition>;

  /**
   * Field overrides and additions.
   * If omitted, fields are inherited from `extends` (if any).
   */
  fields?: Record<string, Ref<RefProperty>>;

  /**
   * If true, all inherited fields become optional.
   * Useful for PATCH-style updates.
   */
  partial?: boolean;
}
