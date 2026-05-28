import { XCodegenKind, XCodegenDtoRole } from '@/pipeline/targets/codegen/codegen-extension.types';
import { ComponentRefMap } from '@/pipeline/targets/openapi/components/component.types';
import { EngineIdPart, createEngineId } from '@/utils/ids/engine-id';
import { RefKind } from '../../refs/ref-kind';
import type { ResponseRef } from '../../refs/ref.types';
import type { OptionalResourceContext } from '../../resource/resource-context.types';
import type { ResponseComponentDefinition, ResponseComponentRegistry } from './response-component.types';

export interface DefineResponsesOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineResponses<TInput extends Record<string, Omit<ResponseComponentDefinition, 'name'>>>(
  options: DefineResponsesOptions,
  input: TInput,
): ResponseComponentRegistry<ComponentRefMap<TInput, ResponseRef>> {
  return {
    name: options.name,
    definitions: Object.entries(input).map(([name, value]) => ({ name, ...value })) as ResponseComponentDefinition[],
    ref: createRefs(options, input),
  };
}

function createRefs<TInput extends Record<string, unknown>>(
  options: DefineResponsesOptions,
  input: TInput,
): ComponentRefMap<TInput, ResponseRef> {
  return Object.fromEntries(Object.keys(input).map((name) => [name, createResponseRef(options, name)])) as ComponentRefMap<
    TInput,
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
      kind: XCodegenKind.dto,
      role: XCodegenDtoRole.response,
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

function createScopedId(options: DefineResponsesOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}
