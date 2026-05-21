import type { EngineRef } from "./ref.types.js";
import type { RefUsage, RefWithUsageMethods } from "./ref-usage.types.js";

export function withRefMethods<TRef extends EngineRef>(
  ref: TRef,
): RefWithUsageMethods<TRef> {
  return Object.assign(ref, {
    optional: () => createUsage(ref, { required: false }),
    required: () => createUsage(ref, { required: true }),
    nullable: () => createUsage(ref, { nullable: true }),
    nonNullable: () => createUsage(ref, { nullable: false }),
  });
}

function createUsage<TRef extends EngineRef>(
  ref: TRef,
  usage: Omit<RefUsage<TRef>, "ref">,
): RefUsage<TRef> {
  return {
    ref,
    ...usage,
  };
}
