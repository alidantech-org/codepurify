import { CODEGEN_EXTENSION_KEY } from './codegen-extension.keys.js';
import type { CodegenMetadata } from './codegen-extension.types.js';

export type CodegenExtensionTarget = Record<string, unknown>;

function cleanCodegenValue(value: unknown): unknown {
  if (value === undefined || value === null || value === false) return undefined;
  if (typeof value === 'string' && value.length === 0) return undefined;

  if (Array.isArray(value)) {
    const items = value
      .map(cleanCodegenValue)
      .filter((item): item is Exclude<unknown, undefined> => item !== undefined);

    return items.length > 0 ? items : undefined;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, child]) => [key, cleanCodegenValue(child)] as const)
      .filter(([, child]) => child !== undefined);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

export function applyCodegenMetadata<TSchema extends Record<string, unknown>>(
  schema: TSchema,
  metadata: CodegenMetadata,
): TSchema {
  const cleaned = cleanCodegenValue(metadata);

  if (cleaned && typeof cleaned === 'object') {
    return {
      ...schema,
      [CODEGEN_EXTENSION_KEY]: cleaned,
    };
  }

  return schema;
}
