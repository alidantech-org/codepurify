import { EngineIdPart, createEngineId } from '../../ids/engine-id.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import { withRefMethods } from '../../refs/ref-methods.js';
import type { RefWithUsageMethods } from '../../refs/ref-usage.types.js';
import type { OptionalResourceContext } from '../../resource/resource-context.types.js';
import { XCodegenKind } from '../../codegen/codegen-extension.types.js';
import type { SchemaComponentDefinition, SchemaComponentRegistry, SchemaComponentValue } from './schema-component.types.js';
import { compileZodRef } from '../../zod/compile-zod-ref.js';
import type { z } from 'zod';

export interface DefineSchemasOptions extends OptionalResourceContext {
  readonly name: string;
}

export function defineSchemas<TInput extends Record<string, SchemaComponentValue>>(
  options: DefineSchemasOptions,
  input: TInput,
  target?: SchemaComponentRegistry,
): SchemaComponentRegistry<TInput> {
  const toZod = options.zodRegistry ? (ref: unknown): z.ZodTypeAny => compileZodRef(ref as ComponentRef, options.zodRegistry!) : undefined;
  const definitions = Object.entries(input).map(([name, value]) => ({
    name,
    value,
  }));
  const ref = createRefs(options, input, toZod);

  if (target) {
    appendDefinitions(target, definitions, ref);
  }

  return {
    name: options.name,
    definitions,
    ref,
  };
}

export function createSchemaComponentRegistry(name: string): SchemaComponentRegistry {
  return {
    name,
    definitions: [],
    ref: {},
  };
}

function appendDefinitions(
  target: SchemaComponentRegistry,
  definitions: readonly SchemaComponentDefinition[],
  ref: Record<string, RefWithUsageMethods<ComponentRef>>,
): void {
  const existing = new Set(target.definitions.map((definition) => definition.name));
  const incoming = new Set<string>();

  for (const definition of definitions) {
    if (existing.has(definition.name) || incoming.has(definition.name)) {
      throw new Error(`Duplicate schema component "${definition.name}" in registry "${target.name}".`);
    }

    incoming.add(definition.name);
  }

  target.definitions.push(...definitions);
  Object.assign(target.ref, ref);
}

function createRefs<TInput extends Record<string, SchemaComponentValue>>(
  options: DefineSchemasOptions,
  input: TInput,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): SchemaComponentRegistry<TInput>['ref'] {
  const entries = Object.keys(input).map((name) => {
    return [name, createSchemaRef(options, name, input[name], toZod)] as const;
  });
  return Object.fromEntries(entries) as SchemaComponentRegistry<TInput>['ref'];
}

function createSchemaRef(
  options: DefineSchemasOptions,
  name: string,
  value: SchemaComponentValue,
  toZod?: (ref: unknown) => z.ZodTypeAny,
): RefWithUsageMethods<ComponentRef> {
  const refId = createScopedId(options, EngineIdPart.component, 'schema', name);
  const isShared = !options.resource;

  const definition = { name, value };

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
        kind: XCodegenKind.dto,
        // Do not set role here - role is determined by route usage (query, body, response, params)
        ...(isShared ? { shared: true } : {}),
        resource: options.resource
          ? {
              name: options.resource.alias,
              path: options.resource.folders,
            }
          : undefined,
      },
    },
    { toZod },
  );
}

function createScopedId(options: DefineSchemasOptions, ...parts: string[]): string {
  if (!options.resource) return createEngineId(...parts);
  return createEngineId(EngineIdPart.resource, options.resource.name, ...parts);
}
