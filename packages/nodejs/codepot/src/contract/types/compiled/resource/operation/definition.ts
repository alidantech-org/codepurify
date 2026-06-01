// src/contract/types/compiled/resource/operation/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { DtoDefinition } from '../../schema/dto/definition';
import type { ModelDefinition } from '../../schema/model/definition';
import type { ParamsDefinition } from '../../schema/params/definition';
import type { SecurityPrincipalDefinition } from '../../security/definition';
import type { ErrorResponseDefinition } from '../../response/errors/definition';

// ============================================================================
// OPERATION SCHEMA REFS
// ============================================================================

export type OperationSchemaRef = Ref<DtoDefinition> | Ref<ModelDefinition>;

export type OperationContextRef = Ref<DtoDefinition> | Ref<ModelDefinition> | Ref<SecurityPrincipalDefinition>;

// ============================================================================
// INPUT / OUTPUT
// ============================================================================

export interface OperationInputDefinition extends DefinitionItem {
  /**
   * Injected request contexts such as auth user, tenant, locale, etc.
   */
  readonly context?: readonly OperationContextRef[];

  /**
   * Path parameter schema.
   */
  readonly params?: Ref<ParamsDefinition>;

  /**
   * Query string schema.
   */
  readonly query?: OperationSchemaRef;

  /**
   * Request body schema.
   */
  readonly body?: OperationSchemaRef;
}

export interface OperationOutputDefinition extends DefinitionItem {
  /**
   * Success payload schema.
   */
  readonly result?: OperationSchemaRef;

  /**
   * Typed error responses.
   */
  readonly errors?: readonly Ref<ErrorResponseDefinition>[];
}

// ============================================================================
// OPERATION
// ============================================================================

export interface OperationDefinition extends DefinitionItem {
  readonly input: OperationInputDefinition;
  readonly output: OperationOutputDefinition;
}
