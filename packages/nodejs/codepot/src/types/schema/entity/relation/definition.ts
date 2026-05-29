import { Ref } from '../../../ref/definition';
import { EntityField } from '../field/definition';

export type EntityRelationKind = 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';

export interface EntityRelationDefinition<TTargetEntity = unknown, TTargetResource = unknown, TTargetField = unknown> {
  kind: EntityRelationKind;

  /**
   * Entity being referenced.
   * Example: tenant_id -> Tenant
   */
  target: Ref<TTargetEntity>;

  /**
   * Optional owning resource.
   * Useful for route/codegen ownership.
   */
  resource?: Ref<TTargetResource>;

  /**
   * Field on the target entity being referenced.
   * Usually target id.
   */
  targetField?: Ref<TTargetField>;

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

  metadata?: Record<string, unknown>;
}

export interface EntityDefinition<TParent = unknown, TField = EntityField, TRelation = EntityRelationDefinition> {
  resource?: string;

  tags?: string[];

  /**
   * Real entity inheritance only.
   * One parent max.
   */
  extends?: Ref<TParent>;

  fields: Record<string, TField>;

  relations?: Record<string, TRelation>;

  description?: string;

  metadata?: Record<string, unknown>;
}
