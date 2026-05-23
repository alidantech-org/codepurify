import type { z } from 'zod';
import type { EngineRef } from './ref.types.js';
import type { ExtendWithFieldMap, RefUsage, RefUsageOptions, RefWithUsageMethods } from './ref-usage.types.js';
import type { ArrayRef, ExtendedRef } from './ref-wrapper.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';

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
      value: (fields: ComponentFieldMap) => createUsage(ref, { extendWith: fields as ExtendWithFieldMap }, options),
    },
    zod: {
      enumerable: false,
      configurable: true,
      value: () => options.toZod?.(ref) ?? throwMissingZodResolver(ref.id),
    },
  });

  return target;
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
      value: (fields: ExtendWithFieldMap) => createUsage(ref, { ...usage, extendWith: fields }, options),
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
