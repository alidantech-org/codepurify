import type { PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { isZodEnum } from '../../schema/is-zod-enum.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';
import { SdkKind } from '../../sdk/sdk-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';

export function compileNamedPropertySchema(field: SchemaField, ref: PropertyRef): unknown {
  const schema = compilePropertySchema(field);

  if (!schema || typeof schema !== 'object' || Array.isArray(schema) || !ref.meta) {
    return schema;
  }

  const isEnum = 'zod' in field && isZodEnum(field.zod);

  applySdkExtensions(schema as Record<string, unknown>, {
    ...ref.meta,
    kind: isEnum ? SdkKind.enum : SdkKind.primitive,
    skip: isEnum ? false : true,
  });

  return schema;
}
