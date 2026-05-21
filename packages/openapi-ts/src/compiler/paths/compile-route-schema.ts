import type { ComponentFieldMap } from '../../components/component.types.js';
import { compileComponentSchema } from '../schemas/compile-component-schema.js';
import { resolvePendingRefs } from '../refs/resolve-pending-refs.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import type { RouteSchemaRef } from '../../routes/route.types.js';
import { RefKind } from '../../refs/ref-kind.js';

export function compileRouteSchema(schema: RouteSchemaRef, resolver: RefResolver): unknown {
  if (isRefKind(schema, RefKind.model) || isRefKind(schema, RefKind.component)) {
    return resolvePendingRefs({ $ref: `#pending/${schema.id}` }, resolver);
  }

  return resolvePendingRefs(
    compileComponentSchema({
      name: 'InlineRouteSchema',
      fields: schema as ComponentFieldMap,
    }),
    resolver,
  );
}

function isRefKind(value: unknown, kind: string): boolean {
  return !!value && typeof value === 'object' && 'id' in value && 'kind' in value && value.kind === kind;
}
