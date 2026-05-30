// src/contract/builders/define-dto-schemas.ts

import type { DtoDefinition } from '@/contract/types/schema/dto/definition';
import type { ParamsDefinition } from '@/contract/types/schema/params/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { DtoAuthoringRef, ParamsAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  DtoSchemasBuilder,
  DtoSchemaInputMap,
  DtoSchemasResult,
  ParamsSchemaInputMap,
  ParamsSchemasResult,
} from '@/contract/types/core/5.dto-schemas-builder';

import { dtoRef, paramsRef } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineDtoSchemasOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>;
}

// ============================================================================
// STATE HELPERS
// ============================================================================

function ensureState(state: Pick<Partial<SchemasDefinition>, 'dtos' | 'params'>): Pick<SchemasDefinition, 'dtos' | 'params'> {
  state.dtos ??= {};
  state.params ??= {};

  return state as Pick<SchemasDefinition, 'dtos' | 'params'>;
}

function writeDtoSchemas<TSchemas extends DtoSchemaInputMap>(state: Pick<SchemasDefinition, 'dtos' | 'params'>, schemas: TSchemas): void {
  for (const [key, value] of Object.entries(schemas) as [keyof TSchemas & string, TSchemas[keyof TSchemas & string]][]) {
    state.dtos[key] = value as unknown as DtoDefinition;
  }
}

function writeParamsSchemas<TParams extends ParamsSchemaInputMap>(
  state: Pick<SchemasDefinition, 'dtos' | 'params'>,
  params: TParams,
): void {
  for (const [key, value] of Object.entries(params) as [keyof TParams & string, TParams[keyof TParams & string]][]) {
    state.params[key] = value as unknown as ParamsDefinition;
  }
}

function createDtoRefs<TSchemas extends DtoSchemaInputMap>(schemas: TSchemas): Record<keyof TSchemas & string, DtoAuthoringRef> {
  const refs = {} as Record<keyof TSchemas & string, DtoAuthoringRef>;

  for (const key of Object.keys(schemas) as Array<keyof TSchemas & string>) {
    refs[key] = dtoRef(key);
  }

  return refs;
}

function createParamsRefs<TParams extends ParamsSchemaInputMap>(params: TParams): Record<keyof TParams & string, ParamsAuthoringRef> {
  const refs = {} as Record<keyof TParams & string, ParamsAuthoringRef>;

  for (const key of Object.keys(params) as Array<keyof TParams & string>) {
    refs[key] = paramsRef(key);
  }

  return refs;
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

      writeDtoSchemas(state, schemas);

      return {
        schemas,
        ref: createDtoRefs(schemas) as DtoSchemasResult<TSchemas>['ref'],
      };
    },

    params<TParams extends ParamsSchemaInputMap>(params: TParams): ParamsSchemasResult<TParams> {
      const state = ensureState(options.state);

      writeParamsSchemas(state, params);

      return {
        params,
        ref: createParamsRefs(params) as ParamsSchemasResult<TParams>['ref'],
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
