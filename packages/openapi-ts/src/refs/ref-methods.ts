import type { EngineRef } from './ref.types.js';
import type { RefUsage, RefUsageOptions, RefWithUsageMethods } from './ref-usage.types.js';

export function withRefMethods<TRef extends EngineRef>(ref: TRef): RefWithUsageMethods<TRef> {
  return Object.assign(ref, {
    optional: () => createUsage(ref, { required: false }),
    required: () => createUsage(ref, { required: true }),
    nullable: () => createUsage(ref, { nullable: true }),
    nonNullable: () => createUsage(ref, { nullable: false }),
  });
}

function createUsage<TRef extends EngineRef>(ref: TRef, usage: RefUsageOptions): RefUsage<TRef> {
  const current: RefUsage<TRef> = {
    ref,
    usage,
    optional: () => createUsage(ref, { ...usage, required: false }),
    required: () => createUsage(ref, { ...usage, required: true }),
    nullable: () => createUsage(ref, { ...usage, nullable: true }),
    nonNullable: () => createUsage(ref, { ...usage, nullable: false }),
  };

  return current;
}
