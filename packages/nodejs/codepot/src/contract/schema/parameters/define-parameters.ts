import { XCodegenKind, XCodegenDtoRole } from '@/pipeline/targets/codegen/codegen-extension.types';
import { ComponentRefMap } from '@/pipeline/targets/openapi/components/component.types';
import { EngineIdPart, createEngineId } from '@/utils/ids/engine-id';
import { RefKind } from '../../refs/ref-kind';
import type { ParameterRef } from '../../refs/ref.types';
import type { OptionalResourceContext } from '../../resource/resource-context.types';
import type { ParameterComponentDefinition, ParameterComponentRegistry } from './parameter-component.types';

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
      kind: XCodegenKind.dto,
      role: XCodegenDtoRole.params,
      ...(!options.resource ? { shared: true } : {}),
      resource: options.resource
        ? {
            name: options.resource.alias,
            path: options.resource.folders,
          }
        : undefined,
    },
  };
}

function createScopedId(options: DefineParametersOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}
