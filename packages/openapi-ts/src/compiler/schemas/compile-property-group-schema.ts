import type { PropertyDefinition, PropertyRefGroup } from '../../properties/property.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { resolvePendingRefs } from '../refs/resolve-pending-refs.js';
import { SdkKind, SdkPlacement } from '../../sdk/sdk-extension.types.js';

export function compilePropertyGroupSchema(
  definition: PropertyDefinition,
  refs: PropertyRefGroup,
  resolver: RefResolver,
): Record<string, unknown> {
  const required = Object.keys(refs);

  const schema: Record<string, unknown> = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(refs).map(([key, ref]) => [
        key,
        resolvePendingRefs(
          { $ref: `#pending/${ref.targetRefId ?? ref.id}` },
          resolver,
        ),
      ]),
    ),
  };

  if (required.length > 0) {
    schema.required = required;
  }

  if (definition.kind === 'shared') {
    schema['x-sdk-kind'] = SdkKind.model;
    schema['x-sdk-shared'] = true;
    schema['x-sdk-placement'] = SdkPlacement.globalShared;
  }

  if (definition.abstract) {
    schema['x-sdk-abstract'] = true;
  }

  return schema;
}
