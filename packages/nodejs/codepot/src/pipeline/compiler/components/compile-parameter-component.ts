import { resolvePendingRefs } from '../refs/resolve-pending-refs';
import type { RefResolver } from '../refs/ref-resolver.types';
import { RefKind } from '@/contract/refs/ref-kind';
import { ParameterComponentDefinition } from '@/contract/schema/parameters/parameter-component.types';
import { applyCodegenMetadata } from '@/pipeline/targets/codegen/apply-codegen-extensions';

export function compileParameterComponent(definition: ParameterComponentDefinition, resolver: RefResolver): Record<string, unknown> {
  const parameter: Record<string, unknown> = {
    name: definition.name,
    in: definition.in,
    required: definition.required ?? definition.in === 'path',
    description: definition.description,
    schema: resolvePendingRefs(toSchema(definition.schema), resolver),
  };

  if (definition.meta) {
    return applyCodegenMetadata(parameter, definition.meta);
  }

  return parameter;
}

function toSchema(schema: ParameterComponentDefinition['schema']): unknown {
  if ('ref' in schema) return { $ref: `#pending/${schema.ref.id}` };
  if ('id' in schema && schema.kind === RefKind.component) return { $ref: `#pending/${schema.id}` };
  if ('id' in schema) return { $ref: `#pending/${schema.id}` };

  return schema;
}
