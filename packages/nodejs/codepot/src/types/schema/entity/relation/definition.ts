import { Ref } from '../../../ref/definition';
import { EntityField } from '../field/definition';

export const EntityRelationKind = {
  oneToOne: 'oneToOne',
  oneToMany: 'oneToMany',
  manyToOne: 'manyToOne',
  manyToMany: 'manyToMany',
} as const;

export type EntityRelationKind = (typeof EntityRelationKind)[keyof typeof EntityRelationKind];

export interface EntityRelationDefinition {
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
  inverse?: string;

  description?: string;

  meta: Record<string, unknown>;
}

export interface EntityDefinition {
  resource?: string;

  tags?: string[];

  /**
   * Real entity inheritance only.
   * One parent max.
   */
  extends?: Ref<EntityDefinition>;

  fields: Record<string, EntityField>;

  relations?: Record<string, EntityRelationDefinition>;

  description?: string;

  meta: Record<string, unknown>;
}
