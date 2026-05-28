import { XCodegenAccess, XCodegenEntityVariant, XCodegenKind } from '@/pipeline/targets/codegen/codegen-extension.types';

import { RefKind } from '../refs/ref-kind';
import type { ModelRef } from '../refs/ref.types';
import { SchemaFieldMap } from '../schema/schema.types';

import type { DefinePropertiesOptions } from './define-properties';
import { createScopedId } from './property-ref.factory';
import type { EntityPropertyRefs, PropertyRefGroup } from './property.types';
import { toSchemaName } from '@/index';
import { EngineIdPart } from '@/utils/ids/engine-id';

export type EntityModelKey =
  | 'abstract-model'
  | 'model'
  | 'public-model'
  | 'internal-model'
  | 'partial-model'
  | 'public-partial-model'
  | 'internal-partial-model'
  | 'query-filter'
  | 'advanced-query-filter'
  | 'query-sort-value'
  | 'query-select-value';

export function createModelRef(
  options: DefinePropertiesOptions,
  name: string,
  modelKey: EntityModelKey,
  fields: PropertyRefGroup,
  sourceFields?: SchemaFieldMap,
  inherited?: readonly EntityPropertyRefs[],
  isAbstract = false,
): ModelRef {
  const refId = createScopedId(options, EngineIdPart.model, name, modelKey);

  const modelRef: ModelRef = {
    id: refId,
    name: `${name}.${modelKey}`,
    kind: RefKind.model,
    modelKey,
    fields,
    sourceFields,
    openapiRef: `#/components/schemas/${getModelSchemaName(name, modelKey, isAbstract)}`,
    inherits: createInheritanceMeta(inherited, modelKey),
    abstract: isAbstract,
    meta: {
      kind: modelKey === 'query-filter' ? XCodegenKind.dto : XCodegenKind.model,
      ...(modelKey === 'query-filter' ? { role: 'query' as const } : {}),
      resource: options.resource
        ? {
            name: options.resource.alias,
            path: options.resource.folders.length > 0 ? options.resource.folders : undefined,
          }
        : undefined,
      entity: {
        name,
        variant: getModelVariant(modelKey),
        access: getModelAccess(modelKey),
      },
    },
  };

  if (options.zodRegistry) {
    options.zodRegistry.models.set(refId, modelRef);
  }

  return modelRef;
}

export function getModelSchemaName(name: string, modelKey: EntityModelKey, isAbstract: boolean): string {
  if (isAbstract || modelKey === 'abstract-model') {
    return toSchemaName(`${name}AbstractModel`);
  }

  switch (modelKey) {
    case 'model':
      return toSchemaName(`${name}Model`);
    case 'public-model':
      return toSchemaName(`${name}PublicModel`);
    case 'internal-model':
      return toSchemaName(`${name}InternalModel`);
    case 'partial-model':
      return toSchemaName(`${name}PartialModel`);
    case 'public-partial-model':
      return toSchemaName(`${name}PublicPartialModel`);
    case 'internal-partial-model':
      return toSchemaName(`${name}InternalPartialModel`);
    case 'query-filter':
      return toSchemaName(`${name}QueryFilter`);
    case 'advanced-query-filter':
      return toSchemaName(`${name}AdvancedQueryFilter`);
    case 'query-sort-value':
      return toSchemaName(`${name}QuerySortValue`);
    case 'query-select-value':
      return toSchemaName(`${name}QuerySelectValue`);
    default:
      return toSchemaName(`${name}${toSchemaName(modelKey)}Model`);
  }
}

function getModelVariant(modelKey: EntityModelKey): XCodegenEntityVariant {
  return modelKey.includes('partial') ? XCodegenEntityVariant.partial : XCodegenEntityVariant.full;
}

function getModelAccess(modelKey: EntityModelKey): XCodegenAccess {
  if (modelKey.includes('public')) return XCodegenAccess.public;
  if (modelKey.includes('internal')) return XCodegenAccess.internal;
  return XCodegenAccess.default;
}

function createInheritanceMeta(inherited: readonly EntityPropertyRefs[] | undefined, childModelKey: EntityModelKey): ModelRef['inherits'] {
  if (!inherited || inherited.length === 0) return undefined;

  return inherited
    .map((source) => {
      const parentModelRef = selectInheritedModelRef(source, childModelKey);
      if (!parentModelRef) return undefined;

      return {
        modelRef: parentModelRef,
        fields: Object.keys(source.fields),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
}

function selectInheritedModelRef(parent: EntityPropertyRefs, childModelKey: EntityModelKey): ModelRef | undefined {
  switch (childModelKey) {
    case 'model':
    case 'abstract-model':
      return parent.model;

    case 'public-model':
      return parent.publicModel ?? parent.model;

    case 'internal-model':
      return parent.internalModel ?? parent.model;

    case 'partial-model':
      return parent.partialModel ?? parent.model;

    case 'public-partial-model':
      return parent.publicPartialModel ?? parent.partialModel ?? parent.publicModel ?? parent.model;

    case 'internal-partial-model':
      return parent.internalPartialModel ?? parent.partialModel ?? parent.internalModel ?? parent.model;

    case 'query-filter':
      return parent.queryFilterModel;

    case 'advanced-query-filter':
      return parent.advancedQueryFilterModel;

    case 'query-sort-value':
    case 'query-select-value':
      return undefined;

    default:
      return parent.model;
  }
}
