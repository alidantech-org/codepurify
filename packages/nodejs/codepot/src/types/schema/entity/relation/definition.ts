import { DefinitionItem } from '../../../definition';
import { Ref } from '../../../_shared/ref/definition';
import { EntityDefinition } from '../definition';
import { EntityField } from '../field/definition';

export const EntityRelationKind = {
  oneToOne: 'one_to_one',
  oneToMany: 'one_to_many',
  manyToOne: 'many_to_one',
  manyToMany: 'many_to_many',
} as const;

export type EntityRelationKind = (typeof EntityRelationKind)[keyof typeof EntityRelationKind];

export interface EntityRelationDefinition extends DefinitionItem {
  kind: EntityRelationKind;

  /**
   * Entity being referenced.
   * Example: tenant_id -> Tenant
   */
  target: Ref<EntityDefinition>;

  /**
   * Optional owning resource.
   * Useful for route/codegen ownership.
   */
  resource?: Ref<EntityDefinition>;

  /**
   * Field on the target entity being referenced.
   * Usually target id.
   */
  targetField?: Ref<EntityField>;

  /**
   * Whether this side owns the foreign key.
   */
  owner?: boolean;

  /**
   * Optional inverse relation name on the target side.
   * Example: tenant.members
   */
  inverse?: Ref<EntityField>;
}
