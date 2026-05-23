import type { PropertyRef } from '../../refs/ref.types.js';
import type { SchemaField } from '../../schema/schema.types.js';
import { isZodEnum } from '../../schema/is-zod-enum.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { compilePropertySchema } from './compile-property-schema.js';

export function compileNamedPropertySchema(field: SchemaField, ref: PropertyRef): unknown {
  const schema = compilePropertySchema(field);

  if (!schema || typeof schema !== 'object' || Array.isArray(schema) || !ref.meta) {
    return schema;
  }

  const isEnum = 'zod' in field && isZodEnum(field.zod);

  const codegenMeta: CodegenMetadata = {
    kind: isEnum ? 'enum' : 'property',
    resource: ref.meta.resource,
    group: ref.meta.group,
    entity: ref.meta.placement === 'resource-local' ? extractEntityFromRefId(ref.meta.refId) : undefined,
    property: ref.meta.property,
    refId: ref.meta.refId,
    skip: isEnum ? undefined : true,
  };

  if (ref.meta.shared) {
    codegenMeta.shared = true;
  }

  return applyCodegenMetadata(schema as Record<string, unknown>, codegenMeta);
}

function extractEntityFromRefId(refId: string | undefined): string | undefined {
  if (!refId) return undefined;
  const parts = refId.split(':');
  const propertyIndex = parts.indexOf('property');
  if (propertyIndex >= 0 && propertyIndex + 1 < parts.length) {
    return parts[propertyIndex + 1];
  }
  return undefined;
}
