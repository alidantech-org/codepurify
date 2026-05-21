import { OpenApiRefPattern } from "../../openapi/ref-patterns";
import type { RefResolver } from "./ref-resolver.types.js";

const PendingPrefix = "#pending/";

export function resolvePendingRefs(
  value: unknown,
  resolver: RefResolver,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolvePendingRefs(item, resolver));
  }

  if (!isPlainObject(value)) return value;

  if (typeof value.$ref === "string" && value.$ref.startsWith(PendingPrefix)) {
    return resolvePendingRef(value.$ref, resolver);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      resolvePendingRefs(child, resolver),
    ]),
  );
}

function resolvePendingRef(
  pendingRef: string,
  resolver: RefResolver,
): Record<string, string> {
  const refId = pendingRef.slice(PendingPrefix.length);
  const schemaName = resolver.schemas.get(refId);

  if (!schemaName) {
    throw new Error(`Unable to resolve pending ref: ${refId}`);
  }

  return {
    $ref: `${OpenApiRefPattern.schemas}${schemaName}`,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
