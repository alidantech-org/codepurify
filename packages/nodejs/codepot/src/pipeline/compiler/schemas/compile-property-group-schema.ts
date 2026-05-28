import type { PropertyDefinition, PropertyRefGroup } from '@/contract/properties/property.types.js';
import { applyCodegenMetadata } from '@/pipeline/targets/codegen/apply-codegen-extensions.js';
import type { CodegenMetadata } from '@/pipeline/targets/codegen/codegen-extension.types.js';
import { RefResolver } from '../refs/ref-resolver.types';
import { resolvePendingRefs } from '../refs/resolve-pending-refs';

export function compilePropertyGroupSchema(
  definition: PropertyDefinition,
  refs: PropertyRefGroup,
  resolver: RefResolver,
): Record<string, unknown> {
  const required = Object.keys(refs);

  const schema: Record<string, unknown> = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(refs as Record<string, { targetRefId: string; id: string }>).map(([key, ref]) => [
        key,
        resolvePendingRefs({ $ref: `#pending/${ref.targetRefId ?? ref.id}` }, resolver),
      ]),
    ),
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (definition.kind === 'shared' || definition.abstract) {
    const codegenMeta: CodegenMetadata = {
      kind: 'model',
      shared: definition.kind === 'shared' ? true : undefined,
      abstract: definition.abstract ? true : undefined,
    };
    return applyCodegenMetadata(schema, codegenMeta);
  }

  return schema;
}
