import { compileComponentSchema } from '../schemas/compile-component-schema';
import { compilePropertySchema } from '../schemas/compile-property-schema';
import { resolvePendingRefs } from '../refs/resolve-pending-refs';
import type { RefResolver } from '../refs/ref-resolver.types';
import type { RouteSchemaInput, RouteSchemaRef } from '@/contract/routes/route.types';
import type { SchemaField } from '@/contract/schema/schema.types';
import { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types';
import { isEngineRef } from '@/pipeline/validation/ref-guards';
import { isRefUsage } from '@/pipeline/validation/ref-usage-guards';

export function compileRouteSchema(schema: RouteSchemaInput | RouteSchemaRef, resolver: RefResolver): unknown {
  // Handle SchemaField types (only if it's a schema helper output, not a ref)
  if (isSchemaHelperField(schema)) {
    return resolvePendingRefs(compilePropertySchema(schema as SchemaField), resolver);
  }

  // Handle ref usages
  if (isRefUsage(schema)) {
    return resolvePendingRefs({ $ref: `#pending/${schema.ref.id}` }, resolver);
  }

  // Handle engine refs (PropertyRef, ComponentRef, ModelRef)
  if (isEngineRef(schema)) {
    return resolvePendingRefs({ $ref: `#pending/${schema.id}` }, resolver);
  }

  // Handle legacy ComponentFieldMap
  return resolvePendingRefs(
    compileComponentSchema({
      name: 'InlineRouteSchema',
      value: schema as ComponentFieldMap,
    }),
    resolver,
  );
}

function isSchemaHelperField(value: unknown): boolean {
  if (!value || typeof value !== 'object' || !('kind' in value)) return false;
  const kind = value.kind as string;
  // Schema helper fields have kinds like 'primitive', 'composite', 'ref', 'record', etc.
  // But NOT 'property', 'component', 'model', 'parameter', 'requestBody', 'response'
  return (
    kind !== 'property' && kind !== 'component' && kind !== 'model' && kind !== 'parameter' && kind !== 'requestBody' && kind !== 'response'
  );
}
