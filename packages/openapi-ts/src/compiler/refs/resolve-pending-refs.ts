import { OpenApiRefPattern } from '../../openapi/ref-patterns.js';
import type { CompilerContext } from '../compiler-context.types.js';
import type { RefResolver } from './ref-resolver.types.js';

const PendingPrefix = '#pending/';

export function resolvePendingRefs(value: unknown, resolver: RefResolver, context?: CompilerContext): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolvePendingRefs(item, resolver, context));
  }

  if (!isPlainObject(value)) return value;

  if (typeof value.$ref === 'string' && value.$ref.startsWith(PendingPrefix)) {
    return resolvePendingRef(value.$ref, resolver, context);
  }

  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolvePendingRefs(child, resolver, context)]));
}

function resolvePendingRef(pendingRef: string, resolver: RefResolver, context?: CompilerContext): Record<string, string> {
  const refId = pendingRef.slice(PendingPrefix.length);
  const schemaName = resolver.schemas.get(refId);

  if (!schemaName) {
    context?.logger?.debug('Failed pending ref details', { from: pendingRef });
    throw new Error(`Unable to resolve pending ref: ${refId}`);
  }

  const resolvedRef = {
    $ref: `${OpenApiRefPattern.schemas}${schemaName}`,
  };

  context?.logger?.debug('Resolved pending ref', {
    from: pendingRef,
    to: resolvedRef.$ref,
  });

  return resolvedRef;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
