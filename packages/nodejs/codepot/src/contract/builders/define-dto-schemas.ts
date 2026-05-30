// src/contract/builders/define-dto-schemas.ts

import type { DtoDefinition } from '@/contract/types/schema/dto/definition';
import type { ParamsDefinition } from '@/contract/types/schema/params/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';
import type { Ref } from '@/contract/types/ref';

import { AuthoringRefKind, type DtoAuthoringRef, type ParamsAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  DtoSchemasBuilder,
  DtoSchemaInput,
  DtoSchemaInputMap,
  DtoSchemasResult,
  ParamsSchemaInputMap,
  ParamsSchemasResult,
} from '@/contract/types/core/5.dto-schemas-builder';

import { createExtendableAuthoringRef, createAuthoringRef, refPath } from '@/contract/helpers/refs/create-authoring-ref';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineDtoSchemasOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>;
}

// ============================================================================
// PATHS / REFS
// ============================================================================

function dtoBasePath(options: DefineDtoSchemasOptions): string {
  if (options.scope === 'resource' && options.resourceKey) {
    return `#/resources/${options.resourceKey}/schemas/dtos`;
  }

  return '#/schemas/dtos';
}

function paramsBasePath(options: DefineDtoSchemasOptions): string {
  if (options.scope === 'resource' && options.resourceKey) {
    return `#/resources/${options.resourceKey}/schemas/params`;
  }

  return '#/schemas/params';
}

function dtoPath(options: DefineDtoSchemasOptions, key: string): Ref<DtoDefinition> {
  return refPath<DtoDefinition>(`${dtoBasePath(options)}/${key}`);
}

function paramsPath(options: DefineDtoSchemasOptions, key: string): Ref<ParamsDefinition> {
  return refPath<ParamsDefinition>(`${paramsBasePath(options)}/${key}`);
}

function createDtoRef(key: string, options: DefineDtoSchemasOptions): DtoAuthoringRef {
  return createExtendableAuthoringRef({
    path: dtoPath(options, key),
    kind: AuthoringRefKind.schemaDto,
    key,
    name: key,
  }) as DtoAuthoringRef;
}

function createParamsRef(key: string, options: DefineDtoSchemasOptions): ParamsAuthoringRef {
  return createAuthoringRef({
    path: paramsPath(options, key),
    kind: AuthoringRefKind.schemaParams,
    key,
    name: key,
  });
}

// ============================================================================
// STATE
// ============================================================================

function ensureState(state: Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>): Pick<SchemasDefinition, 'dtos' | 'params'> {
  state.dtos ??= {};
  state.params ??= {};

  return state as Pick<SchemasDefinition, 'dtos' | 'params'>;
}

function toDtoDefinition(input: DtoSchemaInput): DtoDefinition {
  return {
    extends: input.extends && 'path' in input.extends ? (input.extends.path as DtoDefinition['extends']) : undefined,
    fields: input.fields as unknown as DtoDefinition['fields'],
    partial: input.partial,
    description: input.description,
    deprecated: input.deprecated,
    meta: input.meta,
  };
}

// ============================================================================
// DEFINE DTO SCHEMAS
// ============================================================================

export function defineDtoSchemas(options: DefineDtoSchemasOptions): DtoSchemasBuilder {
  const builder: DtoSchemasBuilder = {
    get state() {
      return options.state;
    },

    define<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): DtoSchemasResult<TSchemas> {
      const state = ensureState(options.state);
      const refs = {} as Record<keyof TSchemas & string, DtoAuthoringRef>;

      for (const [key, value] of Object.entries(schemas) as [keyof TSchemas & string, TSchemas[keyof TSchemas & string]][]) {
        state.dtos[key] = toDtoDefinition(value);
        refs[key] = createDtoRef(key, options);
      }

      return {
        schemas,
        ref: refs as DtoSchemasResult<TSchemas>['ref'],
      };
    },

    params<TParams extends ParamsSchemaInputMap>(params: TParams): ParamsSchemasResult<TParams> {
      const state = ensureState(options.state);
      const refs = {} as Record<keyof TParams & string, ParamsAuthoringRef>;

      for (const [key, value] of Object.entries(params) as [keyof TParams & string, TParams[keyof TParams & string]][]) {
        state.params[key] = value as unknown as ParamsDefinition;
        refs[key] = createParamsRef(key, options);
      }

      return {
        params,
        ref: refs as ParamsSchemasResult<TParams>['ref'],
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
