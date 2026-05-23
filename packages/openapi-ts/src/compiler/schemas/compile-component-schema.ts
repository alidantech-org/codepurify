import type { ComponentFieldMap, SchemaCompositionFieldValue } from '../../components/component.types.js';
import type { SchemaComponentDefinition, SchemaComponentValue } from '../../components/schemas/schema-component.types.js';
import type { ComponentRef, PropertyRef, ModelRef, EngineRef } from '../../refs/ref.types.js';
import type { ArrayRef, ExtendedRef } from '../../refs/ref-wrapper.types.js';
import type { RefUsage } from '../../refs/ref-usage.types.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { normalizeExtendWithInput } from './normalize-extend-with.js';

export function compileComponentSchema(definition: SchemaComponentDefinition, ref?: ComponentRef): Record<string, unknown> {
  // Handle RefUsage with extendWith (allOf)
  if (isRefUsage(definition.value)) {
    return compileExtendedSchemaComponent(definition, ref);
  }

  // Handle direct EngineRef (alias)
  if (isEngineRef(definition.value)) {
    const schema = { $ref: `#/components/schemas/${definition.value.name}` };
    if (ref?.meta) {
      const codegenMeta: CodegenMetadata = {
        kind: 'dto',
        resource: ref.meta.resource,
        group: ref.meta.group,
        component: definition.name,
        refId: ref.meta.refId,
        shared: ref.meta.shared ? true : undefined,
      };
      return applyCodegenMetadata(schema, codegenMeta);
    }
    return schema;
  }

  // Handle ComponentFieldMap (normal object schema)
  const required = getRequiredKeys(definition.value);

  const schema: Record<string, unknown> = {
    type: 'object',
    properties: compileComponentFields(definition.value),
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (ref?.meta) {
    const codegenMeta: CodegenMetadata = {
      kind: 'dto',
      resource: ref.meta.resource,
      group: ref.meta.group,
      component: definition.name,
      refId: ref.meta.refId,
      shared: ref.meta.shared ? true : undefined,
    };
    return applyCodegenMetadata(schema, codegenMeta);
  }

  return schema;
}

function compileComponentFields(fields: ComponentFieldMap): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, compileCompositionValue(value)]));
}

function compileExtendedSchemaComponent(definition: SchemaComponentDefinition, ref?: ComponentRef): Record<string, unknown> {
  const usage = definition.value as RefUsage<EngineRef>;
  const baseRef = usage.ref as ComponentRef;
  const extendWith = usage.usage.extendWith;

  const allOf: unknown[] = [{ $ref: `#/components/schemas/${baseRef.name}` }];

  const extensionFields = normalizeExtendWithInput(extendWith);

  if (extensionFields) {
    const required = getRequiredKeys(extensionFields);
    const extensionSchema: Record<string, unknown> = {
      type: 'object',
      properties: compileComponentFields(extensionFields),
    };

    if (required.length > 0) {
      extensionSchema.required = required;
    }

    allOf.push(extensionSchema);
  }

  const schema: Record<string, unknown> = { allOf };

  if (ref?.meta) {
    const codegenMeta: CodegenMetadata = {
      kind: 'dto',
      resource: ref.meta.resource,
      group: ref.meta.group,
      component: definition.name,
      refId: ref.meta.refId,
      shared: ref.meta.shared ? true : undefined,
    };
    return applyCodegenMetadata(schema, codegenMeta);
  }

  return schema;
}

function isEngineRef(value: unknown): value is EngineRef {
  return !!value && typeof value === 'object' && 'kind' in value && 'id' in value && 'name' in value;
}

function compileCompositionValue(value: SchemaCompositionFieldValue): unknown {
  let ref = isRefUsage(value) ? value.ref : value;
  let array = isRefUsage(value) ? value.usage.array : false;
  const nullable = isRefUsage(value) ? value.usage.nullable : false;
  let extendWith = isRefUsage(value) ? value.usage.extendWith : undefined;

  // Unwrap ArrayRef and ExtendedRef
  if ('kind' in ref) {
    if (ref.kind === 'array-ref') {
      ref = (ref as ArrayRef).ref as unknown as ComponentRef | PropertyRef | ModelRef;
      array = true;
    } else if (ref.kind === 'extended-ref') {
      const extendedRef = ref as ExtendedRef;
      ref = extendedRef.ref as unknown as ComponentRef | PropertyRef | ModelRef;
      extendWith = extendedRef.fields;
    }
  }

  // Ensure ref is a base ref type (PropertyRef, ModelRef, ComponentRef)
  const baseRef = ref as ComponentRef | PropertyRef | ModelRef;
  let schema: unknown = { $ref: `#pending/${baseRef.id}` };

  // Apply extendWith
  if (extendWith) {
    const extensionFields = normalizeExtendWithInput(extendWith);
    if (extensionFields) {
      const extendedProperties = compileComponentFields(extensionFields);
      schema = {
        allOf: [
          schema,
          {
            type: 'object',
            properties: extendedProperties,
          },
        ],
      };
    }
  }

  // Apply array
  if (array) {
    schema = { type: 'array', items: schema };
  }

  // Apply nullable
  if (nullable) {
    schema = {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function getRequiredKeys(fields: ComponentFieldMap): string[] {
  return Object.entries(fields)
    .filter(([, value]) => !isOptional(value))
    .map(([key]) => key);
}

function isOptional(value: SchemaCompositionFieldValue): boolean {
  if (!isRefUsage(value)) return false;
  return value.usage.required === false;
}
