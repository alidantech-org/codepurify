import { EngineIdPart, createEngineId } from '../../ids/engine-id.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import { withRefMethods } from '../../refs/ref-methods.js';
import type { RefWithUsageMethods } from '../../refs/ref-usage.types.js';
import type { OptionalResourceContext } from '../../resource/resource-context.types.js';
import { SdkKind, SdkPlacement } from '../../sdk/sdk-extension.types.js';
import type { ComponentFieldMap, ComponentRefMap } from '../component.types.js';
import type { SchemaComponentDefinition, SchemaComponentRegistry } from './schema-component.types.js';
import { compileZodRef } from '../../zod/compile-zod-ref.js';
import type { z } from 'zod';

export interface DefineSchemasOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineSchemas<TInput extends Record<string, ComponentFieldMap>>(
  options: DefineSchemasOptions,
  input: TInput,
): SchemaComponentRegistry<TInput> {
  // Create toZod callback if zodRegistry is available
  const toZod = options.zodRegistry ? (ref: unknown): z.ZodTypeAny => compileZodRef(ref as ComponentRef, options.zodRegistry!) : undefined;

  return {
    name: options.name,
    definitions: Object.entries(input).map(([name, fields]) => ({
      name,
      fields,
    })),
    ref: createRefs(options, input, toZod),
  };
}

function createRefs<TInput extends Record<string, ComponentFieldMap>>(
  options: DefineSchemasOptions,
  input: TInput,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): SchemaComponentRegistry<TInput>['ref'] {
  return Object.fromEntries(
    Object.keys(input).map((name) => [name, createSchemaRef(options, name, input[name], toZod)]),
  ) as SchemaComponentRegistry<TInput>['ref'];
}

function createSchemaRef(
  options: DefineSchemasOptions,
  name: string,
  fields: ComponentFieldMap,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): RefWithUsageMethods<ComponentRef> {
  const refId = createScopedId(options, EngineIdPart.component, 'schema', name);
  const isShared = !options.resource;

  const definition = { name, fields };

  // Register schema definition in zodRegistry if available
  if (options.zodRegistry) {
    options.zodRegistry.schemas.set(refId, definition);
  }

  return withRefMethods(
    {
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
    },
    { toZod },
  );
}

function createScopedId(options: DefineSchemasOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.key, ...parts);
}

function getPlacement(options: DefineSchemasOptions): SdkPlacement {
  return options.resource ? SdkPlacement.resourceLocal : SdkPlacement.globalShared;
}
