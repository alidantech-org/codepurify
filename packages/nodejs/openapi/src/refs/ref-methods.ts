import type { z } from 'zod';
import type { EngineRef } from './ref.types.js';
import type {
  ExtendWithInput,
  RefUsage,
  RefUsageOptions,
  RefWithUsageMethods,
  SchemaProjection,
  SchemaProjectionDefinition,
  SchemaProjectionStep,
} from './ref-usage.types.js';
import type { ArrayRef, ExtendedRef } from './ref-wrapper.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';
import { getSourceMetadataFromRef, getSourceMetadataFromExtendWithInput } from './ref-source-metadata.js';

export interface RefMethodOptions {
  readonly toZod?: (value: unknown) => z.ZodTypeAny;
}

export function withRefMethods<TRef extends EngineRef>(ref: TRef, options: RefMethodOptions = {}): RefWithUsageMethods<TRef> {
  const target = ref as RefWithUsageMethods<TRef>;

  Object.defineProperties(target, {
    optional: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { required: false }, options),
    },
    required: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { required: true }, options),
    },
    nullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { nullable: true }, options),
    },
    nonNullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { nullable: false }, options),
    },
    array: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { array: true }, options),
    },
    extendWith: {
      enumerable: false,
      configurable: true,
      value: (fields: ExtendWithInput) => {
        const baseMetadata = getSourceMetadataFromRef(ref, 'base');
        const extensionMetadata = getSourceMetadataFromExtendWithInput(fields);
        return createUsage(ref, { extendWith: fields, composition: { base: baseMetadata, extensions: [extensionMetadata] } }, options);
      },
    },
    zod: {
      enumerable: false,
      configurable: true,
      value: () => options.toZod?.(ref) ?? throwMissingZodResolver(ref.id),
    },
    partial: {
      enumerable: false,
      configurable: true,
      value: () => createProjectionDefinition(ref, 'partial'),
    },
    pick: {
      enumerable: false,
      configurable: true,
      value: (fields: Record<string, true | undefined>) => createProjectionDefinition(ref, 'pick', fields),
    },
    omit: {
      enumerable: false,
      configurable: true,
      value: (fields: Record<string, true | undefined>) => createProjectionDefinition(ref, 'omit', fields),
    },
  });

  return target;
}

function createProjectionDefinition<TRef extends EngineRef>(
  ref: TRef,
  mode: SchemaProjection['mode'],
  fields?: Record<string, true | undefined>,
) {
  const step = createProjectionStep(mode, fields);
  return withProjectionMethods({
    kind: 'schema-projection-definition',
    source: ref.name,
    sourceRefId: ref.id,
    mode: step.mode,
    ...(step.fields ? { fields: step.fields } : {}),
    steps: [step],
  });
}

function createChainedProjectionDefinition<
  TSourceName extends string,
  TFields extends Record<string, unknown>,
>(
  projection: SchemaProjectionDefinition<TSourceName, TFields, SchemaProjection['mode']>,
  mode: SchemaProjection['mode'],
  fields?: Record<string, true | undefined>,
) {
  const step = createProjectionStep(mode, fields);
  return withProjectionMethods({
    kind: 'schema-projection-definition',
    source: projection.source,
    sourceRefId: projection.sourceRefId,
    mode: step.mode,
    ...(step.fields ? { fields: step.fields } : {}),
    steps: [...(projection.steps ?? [{ mode: projection.mode, ...(projection.fields ? { fields: projection.fields } : {}) }]), step],
  });
}

function withProjectionMethods<
  TSourceName extends string,
  TFields extends Record<string, unknown>,
  TMode extends SchemaProjection['mode'],
>(
  projection: Omit<SchemaProjectionDefinition<TSourceName, TFields, TMode>, 'partial' | 'pick' | 'omit'>,
): SchemaProjectionDefinition<TSourceName, TFields, TMode> {
  const target = projection as SchemaProjectionDefinition<TSourceName, TFields, TMode>;

  Object.defineProperties(target, {
    partial: {
      enumerable: false,
      configurable: true,
      value: () => createChainedProjectionDefinition(target, 'partial'),
    },
    pick: {
      enumerable: false,
      configurable: true,
      value: (fields: Record<string, true | undefined>) => createChainedProjectionDefinition(target, 'pick', fields),
    },
    omit: {
      enumerable: false,
      configurable: true,
      value: (fields: Record<string, true | undefined>) => createChainedProjectionDefinition(target, 'omit', fields),
    },
  });

  return target;
}

function createProjectionStep(
  mode: SchemaProjection['mode'],
  fields?: Record<string, true | undefined>,
): SchemaProjectionStep {
  return {
    mode,
    ...(fields ? { fields: projectionKeys(fields) } : {}),
  };
}

function projectionKeys(fields: Record<string, true | undefined>): string[] {
  return Object.entries(fields).map(([key, enabled]) => {
    if (enabled !== true) {
      throw new Error(`Projection field "${key}" must be true. Use only { fieldName: true }.`);
    }

    return key;
  });
}

function createUsage<TRef extends EngineRef>(ref: TRef, usage: RefUsageOptions, options: RefMethodOptions): RefUsage<TRef> {
  const current = {
    ref,
    usage,
  } as RefUsage<TRef>;

  Object.defineProperties(current, {
    optional: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, required: false }, options),
    },
    required: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, required: true }, options),
    },
    nullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, nullable: true }, options),
    },
    nonNullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, nullable: false }, options),
    },
    array: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, array: true }, options),
    },
    extendWith: {
      enumerable: false,
      configurable: true,
      value: (fields: ExtendWithInput) => {
        const existingComposition = usage.composition;
        const baseMetadata = existingComposition?.base ?? getSourceMetadataFromRef(ref, 'base');
        const extensionMetadata = getSourceMetadataFromExtendWithInput(fields);
        const existingExtensions = existingComposition?.extensions ?? [];
        return createUsage(
          ref,
          { ...usage, extendWith: fields, composition: { base: baseMetadata, extensions: [...existingExtensions, extensionMetadata] } },
          options,
        );
      },
    },
    zod: {
      enumerable: false,
      configurable: true,
      value: () => options.toZod?.(ref) ?? throwMissingZodResolver(ref.id),
    },
  });

  return current;
}

function createArrayRef<TRef extends EngineRef>(ref: TRef, options: RefMethodOptions): ArrayRef<TRef> {
  return {
    kind: 'array-ref',
    ref,
    zod: () => options.toZod?.(ref) ?? throwMissingZodResolver(ref.id),
  };
}

function createExtendedRef<TRef extends EngineRef>(ref: TRef, fields: ComponentFieldMap, options: RefMethodOptions): ExtendedRef<TRef> {
  return {
    kind: 'extended-ref',
    ref,
    fields,
    zod: () => options.toZod?.(ref) ?? throwMissingZodResolver(ref.id),
  };
}

function throwMissingZodResolver(refId: string): never {
  throw new Error(`Zod resolver not provided for ref: ${refId}`);
}
