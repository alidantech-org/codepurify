import { Ref } from '../../_shared/ref/definition';
import { EntityField } from './field/definition';

export interface EntityDefinition {
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
  extends?: Ref<EntityDefinition>;

  /**
   * Entity-owned fields only.
   * Inherited fields come from `extends` and must not be duplicated in output.
   */
  fields: Record<string, EntityField>;

  description?: string;

  meta: Record<string, unknown>;
}
