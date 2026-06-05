import type { PropertyRef } from '../../refs/ref.types.js';
import type { PrimitiveQueryOptions } from '../../schema/query-behavior.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { isZodEnum } from '../../schema/is-zod-enum.js';
import { applyCodegenMetadata } from '../../codegen/apply-codegen-extensions.js';
import { XCodegenKind, type CodegenMetadata, type XCodegenQueryMeta } from '../../codegen/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';

export function compileNamedPropertySchema(field: SchemaField, ref: PropertyRef): unknown {
  const schema = compilePropertySchema(field);

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema;
  }

  const isEnum = 'zod' in field && isZodEnum(field.zod);

  return applyCodegenMetadata(schema as Record<string, unknown>, buildFieldCodegenMetadata(field, isEnum));
}

function buildFieldCodegenMetadata(field: SchemaField, isEnum: boolean): CodegenMetadata {
  const query = getQueryMetadata(field);
  const sensitive = isSensitiveField(field);

  if (isEnum) {
    return {
      kind: XCodegenKind.enum,
      ...(sensitive ? { sensitive: true } : {}),
      ...(query ? { query } : {}),
    };
  }

  return {
    kind: XCodegenKind.primitive,
    ...(sensitive ? { sensitive: true } : {}),
    ...(query ? { query } : {}),
  };
}

function isSensitiveField(field: SchemaField): boolean {
  if (!('access' in field)) return false;

  return field.access === 'secret' || field.access === 'internal' || field.access === 'system';
}

function getQueryMetadata(field: SchemaField): XCodegenQueryMeta | undefined {
  if (!('query' in field)) return undefined;
  if (!isPrimitiveQueryOptions(field.query)) return undefined;

  return normalizeQueryMetadata(field.query);
}

function normalizeQueryMetadata(query: PrimitiveQueryOptions): XCodegenQueryMeta | undefined {
  const normalized: XCodegenQueryMeta = {
    ...(query.filter === true ? { filter: true } : {}),
    ...(query.operators && query.operators.length > 0 ? { operators: query.operators } : {}),
    ...(query.sort === true ? { sort: true } : {}),
    ...(query.select === true ? { select: true } : {}),
  };

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function isPrimitiveQueryOptions(value: unknown): value is PrimitiveQueryOptions {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
