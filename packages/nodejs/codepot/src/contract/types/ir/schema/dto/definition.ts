// src/contract/types/compiled/schema/dto/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { EntityFieldDefinition } from '../entity/field/definition';
import type { ModelDefinition } from '../model/definition';

// ============================================================================
// DTO FIELD
// ============================================================================

export interface DtoArrayFieldDefinition extends DefinitionItem {
  readonly type: 'array';
  readonly items: Ref<EntityFieldDefinition> | Ref<ModelDefinition> | Ref<DtoDefinition>;
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export interface DtoRefFieldDefinition extends DefinitionItem {
  readonly ref: Ref<EntityFieldDefinition> | Ref<ModelDefinition> | Ref<DtoDefinition>;
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export type DtoFieldDefinition =
  | Ref<EntityFieldDefinition>
  | Ref<ModelDefinition>
  | Ref<DtoDefinition>
  | DtoRefFieldDefinition
  | DtoArrayFieldDefinition;

// ============================================================================
// DTO DEFINITION
// ============================================================================

export interface DtoDefinition extends DefinitionItem {
  /**
   * Direct DTO source.
   * Example: UserPublic DTO can be from UserPublic model.
   */
  readonly from?: Ref<ModelDefinition> | Ref<DtoDefinition>;

  /**
   * DTO inheritance.
   * Example: UserResponse extends ApiResponse.
   */
  readonly extends?: Ref<DtoDefinition>;

  /**
   * Compiled DTO fields only.
   * Inherited DTO fields should live on `extends`, not be duplicated here.
   */
  readonly fields: Record<string, DtoFieldDefinition>;

  readonly partial?: boolean;
}
