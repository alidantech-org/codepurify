import { Ref } from '../../ref/definition';
import { EntityField } from './field/definition';

export interface EntityDefinition<TParent = unknown, TField = EntityField> {
  /**
   * Optional owning resource key.
   * Example: "users"
   */
  resource?: string;

  /**
   * Optional grouping/search/docs tags.
   */
  tags?: string[];

  /**
   * Real entity inheritance only.
   * One parent max to keep generated classes safe.
   */
  extends?: Ref<TParent>;

  /**
   * Entity-owned fields only.
   * Inherited fields come from `extends` and must not be duplicated in output.
   */
  fields: Record<string, TField>;

  description?: string;

  meta: Record<string, unknown>;
}
