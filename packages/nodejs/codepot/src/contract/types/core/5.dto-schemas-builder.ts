import type { DefinitionItem } from '@/contract/types/definition';

import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type {
  ArrayUsageOptions,
  DtoAuthoringRef,
  EntityFieldAuthoringRef,
  MaybeUsage,
  ModelAuthoringRef,
  ParamsAuthoringRef,
  PropertyAuthoringRef,
  UsageOf,
} from './3.authoring-ref';

// ============================================================================
// DTO FIELD SOURCE
// ============================================================================

export const DtoFieldSourceKind = {
  property: 'property',
  entityField: 'entity_field',
  model: 'model',
  dto: 'dto',
  params: 'params',
} as const;

export type DtoFieldSourceKind = (typeof DtoFieldSourceKind)[keyof typeof DtoFieldSourceKind];

export type DtoSchemaRef = PropertyAuthoringRef | EntityFieldAuthoringRef | ModelAuthoringRef | DtoAuthoringRef | ParamsAuthoringRef;

export type DtoSchemaRefUsage = MaybeUsage<DtoSchemaRef>;

export type DtoFieldSource = DtoSchemaRef | DtoSchemaRefUsage;

export interface DtoFieldInput extends DefinitionItem {
  readonly source: DtoFieldSource;

  readonly required?: boolean;

  readonly nullable?: boolean;

  readonly array?: true | ArrayUsageOptions;

  readonly default?: unknown;
}

export type DtoFieldInputMap = Record<string, DtoFieldInput | DtoFieldSource>;

// ============================================================================
// DTO EXTENSION
// ============================================================================

export type DtoExtendsInput =
  | ModelAuthoringRef<DtoFieldInputMap>
  | DtoAuthoringRef<DtoFieldInputMap>
  | UsageOf<ModelAuthoringRef<DtoFieldInputMap>>
  | UsageOf<DtoAuthoringRef<DtoFieldInputMap>>;

export interface DtoSchemaInput extends DefinitionItem {
  /**
   * Optional inheritance from a model or another DTO.
   */
  readonly extends?: DtoExtendsInput;

  /**
   * DTO-owned fields.
   */
  readonly fields?: DtoFieldInputMap;

  /**
   * PATCH-style DTO.
   */
  readonly partial?: boolean;
}

export type DtoSchemaInputMap = Record<string, DtoSchemaInput>;

// ============================================================================
// PARAMS SCHEMA INPUTS
// ============================================================================

export interface ParamsFieldInput extends DefinitionItem {
  readonly source: PropertyAuthoringRef | EntityFieldAuthoringRef;
  readonly required?: boolean;
  readonly array?: true | ArrayUsageOptions;
}

export type ParamsSchemaInputMap = Record<string, ParamsFieldInput>;

// ============================================================================
// DTO FIELD HELPER
// ============================================================================

export interface DtoFieldHelper {
  from(source: DtoFieldSource, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;

  property(ref: PropertyAuthoringRef, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;

  entityField(ref: EntityFieldAuthoringRef, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;

  model(ref: ModelAuthoringRef, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;

  dto(ref: DtoAuthoringRef, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;

  params(ref: ParamsAuthoringRef, options?: Omit<DtoFieldInput, 'source'>): DtoFieldInput;
}

// ============================================================================
// DTO SCHEMA HELPER
// ============================================================================

export interface DtoSchemaHelper {
  object(fields: DtoFieldInputMap, options?: DefinitionItem): DtoSchemaInput;

  extend(
    base: ModelAuthoringRef<DtoFieldInputMap> | DtoAuthoringRef<DtoFieldInputMap>,
    fields?: DtoFieldInputMap,
    options?: DefinitionItem,
  ): DtoSchemaInput;

  partial(
    base: ModelAuthoringRef<DtoFieldInputMap> | DtoAuthoringRef<DtoFieldInputMap>,
    fields?: DtoFieldInputMap,
    options?: DefinitionItem,
  ): DtoSchemaInput;
}

// ============================================================================
// BUILDER RESULT
// ============================================================================

export interface DtoSchemasResult<TSchemas extends DtoSchemaInputMap> {
  readonly schemas: TSchemas;

  readonly ref: {
    readonly [K in keyof TSchemas & string]: DtoAuthoringRef;
  };
}

export interface ParamsSchemasResult<TParams extends ParamsSchemaInputMap> {
  readonly params: TParams;

  readonly ref: {
    readonly [K in keyof TParams & string]: ParamsAuthoringRef;
  };
}

// ============================================================================
// DTO SCHEMAS BUILDER
// ============================================================================

export interface DtoSchemasBuilder {
  readonly state: Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>;

  define<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): DtoSchemasResult<TSchemas>;

  params<TParams extends ParamsSchemaInputMap>(params: TParams): ParamsSchemasResult<TParams>;

  snapshot(): Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>;
}
