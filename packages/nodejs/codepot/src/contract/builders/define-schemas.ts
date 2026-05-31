// src/contract/builders/define-schemas.ts

import type { DtoDefinition } from '@/contract/types/schema/dto/definition';
import type { ParamsDefinition } from '@/contract/types/schema/params/definition';
import type { EntityDefinition } from '@/contract/types/schema/entity/definition';
import type { EntityField } from '@/contract/types/schema/entity/field/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { DtoAuthoringRef, EntityFieldAuthoringRef, ParamsAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  AnyEntityResult,
  EntityAllFields,
  EntityExtendsInput,
  EntityFieldInput,
  EntityFieldInputLike,
  EntityFieldInputMap,
  EntityFieldSetName,
  EntityFieldSetOverrideFactory,
  EntityFieldSetOverrideInput,
  EntityFieldSetOverrides,
  EntityModelOverrideFactory,
  EntityModelOverrideInput,
  EntityModelOverrides,
  EntityOptions,
  EntityPropertiesResult,
  FieldBuilder,
  MergeEntityFields,
} from '@/contract/types/core/4.properties-builder';

import type {
  DtoFieldInput,
  DtoFieldInputMap,
  DtoRef,
  DtoSchemaInput,
  DtoSchemaInputMap,
  DtoSchemasResult,
  ParamsInputMap,
  ParamsResult,
  SchemasBuilder,
} from '@/contract/types/core/5.schemas-builder';

import { entityFieldSetOverrideBuilder, entityModelOverrideBuilder } from '@/contract/helpers/properties/property';

import { dtoRef, entityFieldRef, entityFieldSetRefs, entityRef, modelRefs, paramsRef } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineSchemasOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Partial<SchemasDefinition>;
}

// ============================================================================
// STATE
// ============================================================================

function ensureState(state: Partial<SchemasDefinition>): Partial<SchemasDefinition> {
  state.entities ??= {};
  state.models ??= {};
  state.dtos ??= {};
  state.params ??= {};

  return state;
}

// ============================================================================
// ENTITY FIELD NORMALIZATION
// ============================================================================

function isEntityFieldBuilder(value: EntityFieldInputLike): value is FieldBuilder {
  return !!value && typeof value === 'object' && 'input' in value;
}

function toEntityFieldInput(value: EntityFieldInputLike): EntityFieldInput {
  return isEntityFieldBuilder(value) ? value.input : value;
}

function normalizeEntityFields<TFields extends EntityFieldInputMap>(fields: TFields): Record<keyof TFields & string, EntityFieldInput> {
  const normalized = {} as Record<keyof TFields & string, EntityFieldInput>;

  for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
    normalized[key] = toEntityFieldInput(value);
  }

  return normalized;
}

// ============================================================================
// ENTITY REFS
// ============================================================================

function createEntityFieldRefs<TFields extends EntityFieldInputMap>(
  entityName: string,
  fields: TFields,
): Record<keyof TFields & string, EntityFieldAuthoringRef> {
  const refs = {} as Record<keyof TFields & string, EntityFieldAuthoringRef>;

  for (const key of Object.keys(fields) as Array<keyof TFields & string>) {
    refs[key] = entityFieldRef(entityName, key);
  }

  return refs;
}

function createInheritedFieldRefs<TParent extends EntityExtendsInput | undefined>(
  parent: TParent,
): TParent extends EntityExtendsInput ? Record<keyof EntityAllFields<TParent> & string, EntityFieldAuthoringRef> : {} {
  if (!parent) return {} as never;

  return parent.ref.fields as never;
}

function createAllEntityFieldRefs<TParent extends EntityExtendsInput | undefined, TOwnFields extends EntityFieldInputMap>(
  entityName: string,
  ownFields: TOwnFields,
  parent: TParent,
): Record<keyof MergeEntityFields<TParent, TOwnFields> & string, EntityFieldAuthoringRef> {
  return {
    ...createInheritedFieldRefs(parent),
    ...createEntityFieldRefs(entityName, ownFields),
  } as Record<keyof MergeEntityFields<TParent, TOwnFields> & string, EntityFieldAuthoringRef>;
}

// ============================================================================
// ENTITY MODEL / FIELD SET OVERRIDES
// ============================================================================

function normalizeEntityModelOverride<TFields extends EntityFieldInputMap>(
  value: EntityModelOverrideInput<TFields> | EntityModelOverrideFactory<TFields>,
): EntityModelOverrideInput<TFields> {
  if (typeof value === 'function') {
    return value(entityModelOverrideBuilder<TFields>()).input;
  }

  return value;
}

function normalizeEntityModelOverrides<TFields extends EntityFieldInputMap>(
  models: EntityModelOverrides<TFields>,
): Partial<Record<keyof EntityModelOverrides<TFields> & string, EntityModelOverrideInput<TFields>>> {
  const normalized = {} as Partial<Record<keyof EntityModelOverrides<TFields> & string, EntityModelOverrideInput<TFields>>>;

  for (const [key, value] of Object.entries(models) as [
    keyof EntityModelOverrides<TFields> & string,
    NonNullable<EntityModelOverrides<TFields>[keyof EntityModelOverrides<TFields>]>,
  ][]) {
    normalized[key] = normalizeEntityModelOverride(value);
  }

  return normalized;
}

function normalizeEntityFieldSetOverride<TFields extends EntityFieldInputMap>(
  value: EntityFieldSetOverrideInput<TFields> | EntityFieldSetOverrideFactory<TFields>,
): EntityFieldSetOverrideInput<TFields> {
  if (typeof value === 'function') {
    return value(entityFieldSetOverrideBuilder<TFields>()).input;
  }

  return value;
}

function normalizeEntityFieldSetOverrides<TFields extends EntityFieldInputMap>(
  overrides: EntityFieldSetOverrides<TFields>,
): Partial<Record<EntityFieldSetName, EntityFieldSetOverrideInput<TFields>>> {
  const normalized: Partial<Record<EntityFieldSetName, EntityFieldSetOverrideInput<TFields>>> = {};

  for (const [key, value] of Object.entries(overrides) as [
    keyof EntityFieldSetOverrides<TFields> & string,
    NonNullable<EntityFieldSetOverrides<TFields>[keyof EntityFieldSetOverrides<TFields>]>,
  ][]) {
    normalized[key as EntityFieldSetName] = normalizeEntityFieldSetOverride(value);
  }

  return normalized;
}

function writeEntityModelOverrides<TFields extends EntityFieldInputMap>(
  schemas: Partial<SchemasDefinition>,
  name: string,
  models: EntityModelOverrides<TFields>,
): void {
  const state = ensureState(schemas);
  const entity = state.entities?.[name] as
    | (EntityDefinition & {
        modelOverrides?: Partial<Record<keyof EntityModelOverrides<TFields> & string, EntityModelOverrideInput<TFields>>>;
      })
    | undefined;

  if (!entity) return;

  entity.modelOverrides = normalizeEntityModelOverrides(models);
}

function writeEntityFieldSetOverrides<TFields extends EntityFieldInputMap>(
  schemas: Partial<SchemasDefinition>,
  name: string,
  overrides: EntityFieldSetOverrides<TFields>,
): void {
  const state = ensureState(schemas);
  const entity = state.entities?.[name] as
    | (EntityDefinition & {
        fieldSetOverrides?: Partial<Record<EntityFieldSetName, EntityFieldSetOverrideInput<TFields>>>;
      })
    | undefined;

  if (!entity) return;

  entity.fieldSetOverrides = normalizeEntityFieldSetOverrides(overrides);
}

// ============================================================================
// ENTITY WRITING
// ============================================================================

function writeEntitySource<TFields extends EntityFieldInputMap, TParent extends EntityExtendsInput | undefined>(
  schemas: Partial<SchemasDefinition>,
  name: string,
  fields: TFields,
  options: EntityOptions<TParent>,
): void {
  const state = ensureState(schemas);
  const normalizedFields = normalizeEntityFields(fields);

  state.entities![name] = {
    fields: normalizedFields as unknown as Record<string, EntityField>,
    extends: options.extends?.entity,
    inheritedFields: options.extends?.ref.fields,
    tags: options.tags,
    description: options.description,
    deprecated: options.deprecated,
    meta: options.meta,
  } as unknown as EntityDefinition;
}

function createEntityResult<TName extends string, TOwnFields extends EntityFieldInputMap, TParent extends EntityExtendsInput | undefined>(
  schemas: Partial<SchemasDefinition>,
  name: TName,
  fields: TOwnFields,
  parent: TParent,
  fieldRefs: Record<keyof MergeEntityFields<TParent, TOwnFields> & string, EntityFieldAuthoringRef>,
): EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>> {
  const allFields = {
    ...((parent?.allFields ?? {}) as EntityFieldInputMap),
    ...fields,
  } as MergeEntityFields<TParent, TOwnFields>;

  const result: EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>> = {
    name,
    fields,
    allFields,
    entity: entityRef(name),
    ref: {
      fields: fieldRefs as EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>>['ref']['fields'],
      models: modelRefs(name) as EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>>['ref']['models'],
      fieldSets: entityFieldSetRefs(name) as EntityPropertiesResult<
        TName,
        TOwnFields,
        MergeEntityFields<TParent, TOwnFields>
      >['ref']['fieldSets'],
    },

    models<TOverrides extends EntityModelOverrides<MergeEntityFields<TParent, TOwnFields>>>(overrides: TOverrides) {
      writeEntityModelOverrides(schemas, name, overrides);
      return result;
    },

    fieldSets<TOverrides extends EntityFieldSetOverrides<MergeEntityFields<TParent, TOwnFields>>>(overrides: TOverrides) {
      writeEntityFieldSetOverrides(schemas, name, overrides);
      return result;
    },
  };

  return result;
}

// ============================================================================
// DTO NORMALIZATION
// ============================================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isFieldBuilder(value: unknown): value is FieldBuilder {
  return isRecord(value) && 'input' in value;
}

function isAuthoringRefOrUsage(value: unknown): boolean {
  return isRecord(value) && ('id' in value || 'kind' in value || 'ref' in value);
}

function normalizeDtoSchema(value: DtoSchemaInput): unknown {
  // Direct ref/usage - wrap as source for storage
  if (isAuthoringRefOrUsage(value)) {
    return { source: value };
  }

  // Flat field map - wrap in fields
  return {
    fields: normalizeDtoFields(value as DtoFieldInputMap),
  };
}

function normalizeDtoFields(fields: DtoFieldInputMap): DtoFieldInputMap {
  // DTO fields are already refs/usages, no transformation needed
  return fields;
}

function writeDtoSchemas<TSchemas extends DtoSchemaInputMap>(schemasState: Partial<SchemasDefinition>, schemas: TSchemas): void {
  const state = ensureState(schemasState);

  for (const [key, value] of Object.entries(schemas) as [keyof TSchemas & string, TSchemas[keyof TSchemas & string]][]) {
    state.dtos![key] = normalizeDtoSchema(value) as unknown as DtoDefinition;
  }
}

function createDtoRefs<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): Record<keyof TSchemas & string, DtoAuthoringRef> {
  const refs = {} as Record<keyof TSchemas & string, DtoAuthoringRef>;

  for (const key of Object.keys(schemas) as Array<keyof TSchemas & string>) {
    refs[key] = dtoRef(key);
  }

  return refs;
}

// ============================================================================
// PARAMS
// ============================================================================

function writeParams<TParams extends ParamsInputMap>(schemasState: Partial<SchemasDefinition>, params: TParams): void {
  const state = ensureState(schemasState);

  for (const [key, value] of Object.entries(params) as [keyof TParams & string, TParams[keyof TParams & string]][]) {
    state.params![key] = value as unknown as ParamsDefinition;
  }
}

function createParamsRefs<TParams extends ParamsInputMap>(params: TParams): Record<keyof TParams & string, ParamsAuthoringRef> {
  const refs = {} as Record<keyof TParams & string, ParamsAuthoringRef>;

  for (const key of Object.keys(params) as Array<keyof TParams & string>) {
    refs[key] = paramsRef(key);
  }

  return refs;
}

// ============================================================================
// DEFINE SCHEMAS
// ============================================================================

export function defineSchemas(options: DefineSchemasOptions): SchemasBuilder {
  const builder: SchemasBuilder = {
    get state() {
      return options.state;
    },

    entity<TName extends string, TOwnFields extends EntityFieldInputMap, TParent extends EntityExtendsInput | undefined = undefined>(
      name: TName,
      fields: TOwnFields,
      entityOptions: EntityOptions<TParent> = {},
    ): EntityPropertiesResult<TName, TOwnFields, MergeEntityFields<TParent, TOwnFields>> {
      const fieldRefs = createAllEntityFieldRefs(name, fields, entityOptions.extends);

      writeEntitySource(options.state, name, fields, entityOptions);

      return createEntityResult(options.state, name, fields, entityOptions.extends, fieldRefs);
    },

    dtos<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): DtoSchemasResult<TSchemas> {
      writeDtoSchemas(options.state, schemas);

      return {
        schemas,
        ref: createDtoRefs(schemas) as DtoSchemasResult<TSchemas>['ref'],
      };
    },

    params<TParams extends ParamsInputMap>(params: TParams): ParamsResult<TParams> {
      writeParams(options.state, params);

      return {
        params,
        ref: createParamsRefs(params) as ParamsResult<TParams>['ref'],
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
