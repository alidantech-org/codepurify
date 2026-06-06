import type { PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { isZodEnum } from '../../schema/is-zod-enum.js';
import { applyCodegenMetadata } from '../../codegen/apply-codegen-extensions.js';
import { XCodegenKind, type CodegenMetadata } from '../../codegen/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';

export function compileNamedPropertySchema(field: SchemaField, ref: PropertyRef): unknown {
  const schema = compilePropertySchema(field);

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema;
  }

  const isEnum = 'zod' in field && isZodEnum(field.zod);

  return applyCodegenMetadata(schema as Record<string, unknown>, buildFieldCodegenMetadata(field, ref, isEnum));
}

function buildFieldCodegenMetadata(field: SchemaField, ref: PropertyRef, isEnum: boolean): CodegenMetadata {
  if (isEnum) {
    return {
      kind: XCodegenKind.enum,
      shared: ref.meta?.shared,
      resource: ref.meta?.resource,
    };
  }

  return {
    kind: XCodegenKind.primitive,
    shared: ref.meta?.shared,
    resource: ref.meta?.resource,
  };
}
