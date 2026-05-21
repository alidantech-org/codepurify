import { EngineIdPart, createEngineId } from '../../ids/engine-id.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ResponseRef } from '../../refs/ref.types.js';
import type { OptionalResourceContext } from '../../resource/resource-context.types.js';
import { SdkKind, SdkPlacement } from '../../sdk/sdk-extension.types.js';
import type { ResponseComponentDefinition, ResponseComponentRegistry } from './response-component.types.js';

export interface DefineResponsesOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineResponses<TInput extends Record<string, Omit<ResponseComponentDefinition, 'name'>>>(
  options: DefineResponsesOptions,
  input: TInput,
): ResponseComponentRegistry<Record<keyof TInput & string, ResponseRef>> {
  return {
    name: options.name,
    definitions: Object.entries(input).map(([name, value]) => ({ name, ...value })) as ResponseComponentDefinition[],
    ref: createRefs(options, input),
  };
}

function createRefs<TInput extends Record<string, unknown>>(
  options: DefineResponsesOptions,
  input: TInput,
): Record<keyof TInput & string, ResponseRef> {
  return Object.fromEntries(Object.keys(input).map((name) => [name, createResponseRef(options, name)])) as Record<
    keyof TInput & string,
    ResponseRef
  >;
}

function createResponseRef(options: DefineResponsesOptions, name: string): ResponseRef {
  const refId = createScopedId(options, EngineIdPart.component, 'response', name);

  return {
    id: refId,
    name,
    kind: RefKind.response,
    responseKey: name,
    meta: {
      kind: SdkKind.dto,
      placement: getPlacement(options),
      group: options.resource?.group ?? 'shared',
      resource: options.resource?.key,
      component: name,
      refId,
      shared: !options.resource,
      skip: true,
    },
  };
}

function createScopedId(options: DefineResponsesOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineResponsesOptions): SdkPlacement {
  return options.resource ? SdkPlacement.resourceLocal : SdkPlacement.globalShared;
}
