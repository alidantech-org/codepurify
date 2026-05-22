import type { EngineRef } from './ref.types.js';
import type { ExtendWithFieldMap, RefUsage, RefUsageOptions, RefWithUsageMethods } from './ref-usage.types.js';

export function withRefMethods<TRef extends EngineRef>(ref: TRef): RefWithUsageMethods<TRef> {
  const target = ref as RefWithUsageMethods<TRef>;

  Object.defineProperties(target, {
    optional: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { required: false }),
    },
    required: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { required: true }),
    },
    nullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { nullable: true }),
    },
    nonNullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { nullable: false }),
    },
    array: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { array: true }),
    },
    extendWith: {
      enumerable: false,
      configurable: true,
      value: (fields: ExtendWithFieldMap) => createUsage(ref, { extendWith: fields }),
    },
  });

  return target;
}

function createUsage<TRef extends EngineRef>(ref: TRef, usage: RefUsageOptions): RefUsage<TRef> {
  const current = {
    ref,
    usage,
  } as RefUsage<TRef>;

  Object.defineProperties(current, {
    optional: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, required: false }),
    },
    required: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, required: true }),
    },
    nullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, nullable: true }),
    },
    nonNullable: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, nullable: false }),
    },
    array: {
      enumerable: false,
      configurable: true,
      value: () => createUsage(ref, { ...usage, array: true }),
    },
    extendWith: {
      enumerable: false,
      configurable: true,
      value: (fields: ExtendWithFieldMap) => createUsage(ref, { ...usage, extendWith: fields }),
    },
  });

  return current;
}
