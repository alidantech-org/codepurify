import { EngineIdPart, createEngineId } from '../../ids/engine-id.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import { withRefMethods } from '../../refs/ref-methods.js';
import type { RefWithUsageMethods } from '../../refs/ref-usage.types.js';
import type { OptionalResourceContext } from '../../resource/resource-context.types.js';
import { SdkKind, SdkPlacement } from '../../sdk/sdk-extension.types.js';
import type { ComponentFieldMap, ComponentRefMap } from '../component.types.js';
import type { SchemaComponentDefinition, SchemaComponentRegistry } from './schema-component.types.js';

export interface DefineSchemasOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineSchemas<TInput extends Record<string, ComponentFieldMap>>(
  options: DefineSchemasOptions,
  input: TInput,
): SchemaComponentRegistry<ComponentRefMap<TInput, RefWithUsageMethods<ComponentRef>>> {
  return {
    name: options.name,
    definitions: Object.entries(input).map(([name, fields]) => ({ name, fields })) as SchemaComponentDefinition[],
    ref: createRefs(options, input),
  };
}

function createRefs<TInput extends Record<string, ComponentFieldMap>>(
  options: DefineSchemasOptions,
  input: TInput,
): ComponentRefMap<TInput, RefWithUsageMethods<ComponentRef>> {
  return Object.fromEntries(Object.keys(input).map((name) => [name, createSchemaRef(options, name)])) as ComponentRefMap<
    TInput,
    RefWithUsageMethods<ComponentRef>
  >;
}

function createSchemaRef(options: DefineSchemasOptions, name: string): RefWithUsageMethods<ComponentRef> {
  const refId = createScopedId(options, EngineIdPart.component, 'schema', name);
  const isShared = !options.resource;

  return withRefMethods({
    id: refId,
    name,
    kind: RefKind.component,
    componentKey: name,
    meta: {
      kind: SdkKind.dto,
      placement: getPlacement(options),
      group: options.resource?.group ?? 'shared',
      resource: options.resource?.key,
      component: name,
      refId,
      shared: isShared,
    },
  });
}

function createScopedId(options: DefineSchemasOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineSchemasOptions): SdkPlacement {
  return options.resource ? SdkPlacement.resourceLocal : SdkPlacement.globalShared;
}
