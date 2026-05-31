import type { DefinitionItem } from '@/contract/types/definition';

import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type {
  DtoAuthoringRef,
  EntityFieldAuthoringRef,
  MaybeUsage,
  ModelAuthoringRef,
  ParamsAuthoringRef,
  PropertyAuthoringRef,
} from './3.authoring-ref';

import type {
  EntityExtendsInput,
  EntityFieldInputMap,
  EntityOptions,
  EntityPropertiesResult,
  MergeEntityFields,
} from './4.properties-builder';

// ============================================================================
// DTO FIELD INPUTS
// ============================================================================

export type DtoRef = PropertyAuthoringRef | EntityFieldAuthoringRef | ModelAuthoringRef | DtoAuthoringRef | ParamsAuthoringRef;

export type DtoFieldInput = DtoRef | MaybeUsage<unknown>;

export type DtoFieldInputMap = Record<string, DtoFieldInput>;

export type DtoSchemaInput = DtoFieldInputMap | DtoRef | MaybeUsage<unknown>;

export type DtoSchemaInputMap = Record<string, DtoSchemaInput>;

// ============================================================================
// PARAM INPUTS
// ============================================================================

export type ParamSourceRef = PropertyAuthoringRef | EntityFieldAuthoringRef;

export type ParamsInputMap = Record<string, ParamSourceRef>;

// ============================================================================
// BUILDER RESULTS
// ============================================================================

export interface DtoSchemasResult<TSchemas extends DtoSchemaInputMap> {
  readonly schemas: TSchemas;

  readonly ref: {
    readonly [K in keyof TSchemas & string]: DtoAuthoringRef;
  };
}

export interface ParamsResult<TParams extends ParamsInputMap> {
  readonly params: TParams;

  readonly ref: {
    readonly [K in keyof TParams & string]: ParamsAuthoringRef;
  };
}

// ============================================================================
// SCHEMAS BUILDER
// ============================================================================

export interface SchemasBuilder {
  readonly state: Partial<SchemasDefinition>;

  /**
   * Entity authoring.
   * Entities live under schemas, not properties.
   */
  entity<TName extends string, TOwnFields extends EntityFieldInputMap, TParent extends EntityExtendsInput | undefined = undefined>(
    name: TName,
    fields: TOwnFields,
    options?: EntityOptions<TParent>,
  ): EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>>;

  /**
   * DTO authoring.
   *
   * Supports:
   * - Direct model/DTO assignment: { Name: modelRef }
   * - Flat field map: { Name: { fieldA: ref, fieldB: ref } }
   * - DTO composition via .extendWith(): baseDto.extendWith({ field: ref })
   *
   * DTO fields only accept refs/usages, not field(...) builders.
   */
  dtos<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): DtoSchemasResult<TSchemas>;

  /**
   * Flat params authoring.
   *
   * Example:
   * params({
   *   id: user.ref.fields.id,
   * })
   *
   * Returned refs are accessed as:
   * params.ref.id
   */
  params<TParams extends ParamsInputMap>(params: TParams): ParamsResult<TParams>;

  snapshot(): Partial<SchemasDefinition>;
}
