import { DefinitionItem } from '../../definition';
import { Ref } from '../../ref';
import { EntityField } from './field/definition';
import { EntityRelationDefinition } from './relation/definition';
import { ResourceDefinition } from '../../resource/definition';

export interface EntityDefinition extends DefinitionItem {
  /**
   * Enforced consistency: Use Ref if Resources are first-class definitions.
   */
  resource?: Ref<ResourceDefinition>;

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
   * Abstract entities are reusable schema bases, not concrete entities.
   * They are not emitted as DB tables/entities by default.
   */
  abstract?: boolean;

  /**
   * Entity-owned fields only.
   * Inherited fields come from `extends` and must not be duplicated in output.
   */
  fields: Record<string, EntityField>;

  /**
   * Inline definition: Keeps the relation logic tightly coupled to its source entity,
   * avoiding unnecessary global file fragmentation.
   */
  relations?: Record<string, EntityRelationDefinition>;
}
