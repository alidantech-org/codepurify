import { EngineIdPart, createEngineId } from '../../ids/engine-id.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ParameterRef } from '../../refs/ref.types.js';
import type { OptionalResourceContext } from '../../resource/resource-context.types.js';
import { SdkKind, SdkPlacement } from '../../sdk/sdk-extension.types.js';
import type { ComponentRefMap } from '../component.types.js';
import type { ParameterComponentDefinition, ParameterComponentRegistry } from './parameter-component.types.js';

export interface DefineParametersOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineParameters<TInput extends Record<string, Omit<ParameterComponentDefinition, 'key'>>>(
  options: DefineParametersOptions,
  input: TInput,
): ParameterComponentRegistry<ComponentRefMap<TInput, ParameterRef>> {
  return {
    name: options.name,
    definitions: Object.entries(input).map(([key, value]) => ({ key, ...value })) as ParameterComponentDefinition[],
    ref: createRefs(options, input),
  };
}

function createRefs<TInput extends Record<string, unknown>>(
  options: DefineParametersOptions,
  input: TInput,
): ComponentRefMap<TInput, ParameterRef> {
  return Object.fromEntries(Object.keys(input).map((name) => [name, createParameterRef(options, name)])) as ComponentRefMap<
    TInput,
    ParameterRef
  >;
}

function createParameterRef(options: DefineParametersOptions, name: string): ParameterRef {
  const refId = createScopedId(options, EngineIdPart.component, 'parameter', name);

  return {
    id: refId,
    name,
    kind: RefKind.parameter,
    parameterKey: name,
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

function createScopedId(options: DefineParametersOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineParametersOptions): SdkPlacement {
  return options.resource ? SdkPlacement.resourceLocal : SdkPlacement.globalShared;
}
