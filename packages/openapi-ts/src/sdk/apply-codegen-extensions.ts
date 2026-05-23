import { CODEGEN_EXTENSION_KEY } from './codegen-extension.keys.js';
import type { CodegenMetadata } from './codegen-extension.types.js';
import { resolveCodegenKind, stripEnumInheritanceMetadata } from './resolve-codegen-kind.js';

export type CodegenExtensionTarget = Record<string, unknown>;

function cleanCodegenValue(value: unknown): unknown {
  if (value === undefined || value === null || value === false) return undefined;
  if (typeof value === 'string' && value.length === 0) return undefined;

  if (Array.isArray(value)) {
    const items = value.map(cleanCodegenValue).filter((item): item is Exclude<unknown, undefined> => item !== undefined);

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

export function applyCodegenMetadata<TSchema extends Record<string, unknown>>(schema: TSchema, metadata: CodegenMetadata): TSchema {
  // Resolve the correct kind based on actual schema shape
  const resolvedKind = resolveCodegenKind(schema, metadata.kind);

  // If the resolved kind is enum, strip inheritance metadata
  let finalMetadata = metadata;
  if (resolvedKind === 'enum') {
    finalMetadata = stripEnumInheritanceMetadata(metadata) as CodegenMetadata;
  }

  // Override the kind with the shape-aware resolution
  finalMetadata = { ...finalMetadata, kind: resolvedKind };

  const cleaned = cleanCodegenValue(finalMetadata);

  if (cleaned && typeof cleaned === 'object') {
    return {
      ...schema,
      [CODEGEN_EXTENSION_KEY]: cleaned,
    };
  }

  return schema;
}
