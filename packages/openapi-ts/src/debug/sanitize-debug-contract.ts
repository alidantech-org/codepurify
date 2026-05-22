export function sanitizeDebugContract(value: unknown): unknown {
  return sanitizeDebugValue(value);
}

function sanitizeDebugValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'function') {
    return '[Function]';
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDebugValue(item, seen));
  }

  const record = value as Record<string, unknown>;

  // Zod schemas should not be dumped raw.
  if ('_zod' in record || '_def' in record || 'toJSONSchema' in record) {
    return '[ZodSchema]';
  }

  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(record)) {
    if (typeof child === 'function') {
      continue;
    }

    // Avoid noisy internals
    if (key === 'zod') {
      output[key] = '[ZodSchema]';
      continue;
    }

    output[key] = sanitizeDebugValue(child, seen);
  }

  return output;
}
