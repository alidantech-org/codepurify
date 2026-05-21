import type { EngineRef } from "../refs/ref.types.js";
import type { RefUsage } from "../refs/ref-usage.types.js";
import { isEngineRef } from "./ref-guards.js";

export function isRefUsage(value: unknown): value is RefUsage<EngineRef> {
  return (
    !!value &&
    typeof value === "object" &&
    "ref" in value &&
    isEngineRef(value.ref)
  );
}

export function getRefRequired(value: unknown): boolean | undefined {
  return isRefUsage(value) ? value.required : undefined;
}

export function getRefNullable(value: unknown): boolean | undefined {
  return isRefUsage(value) ? value.nullable : undefined;
}
