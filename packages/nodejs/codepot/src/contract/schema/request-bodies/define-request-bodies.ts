import { XCodegenKind, XCodegenDtoRole } from '@/pipeline/targets/codegen/codegen-extension.types';
import { ComponentRefMap } from '@/pipeline/targets/openapi/components/component.types';
import { EngineIdPart, createEngineId } from '@/utils/ids/engine-id';
import { RefKind } from '../../refs/ref-kind';
import type { RequestBodyRef } from '../../refs/ref.types';
import type { OptionalResourceContext } from '../../resource/resource-context.types';
import type { RequestBodyComponentDefinition, RequestBodyComponentRegistry } from './request-body-component.types';

export interface DefineRequestBodiesOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineRequestBodies<TInput extends Record<string, Omit<RequestBodyComponentDefinition, 'name'>>>(
  options: DefineRequestBodiesOptions,
  input: TInput,
): RequestBodyComponentRegistry<ComponentRefMap<TInput, RequestBodyRef>> {
  return {
    name: options.name,
    definitions: Object.entries(input).map(([name, value]) => ({ name, ...value })) as RequestBodyComponentDefinition[],
    ref: createRefs(options, input),
  };
}

function createRefs<TInput extends Record<string, unknown>>(
  options: DefineRequestBodiesOptions,
  input: TInput,
): ComponentRefMap<TInput, RequestBodyRef> {
  return Object.fromEntries(Object.keys(input).map((name) => [name, createRequestBodyRef(options, name)])) as ComponentRefMap<
    TInput,
    RequestBodyRef
  >;
}

function createRequestBodyRef(options: DefineRequestBodiesOptions, name: string): RequestBodyRef {
  const refId = createScopedId(options, EngineIdPart.component, 'request-body', name);

  return {
    id: refId,
    name,
    kind: RefKind.requestBody,
    requestBodyKey: name,
    meta: {
      kind: XCodegenKind.dto,
      role: XCodegenDtoRole.body,
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

function createScopedId(options: DefineRequestBodiesOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}
