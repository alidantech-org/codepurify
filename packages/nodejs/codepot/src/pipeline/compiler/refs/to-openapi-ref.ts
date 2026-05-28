import { EngineRef } from '@/contract/refs/ref.types';
import { OpenApiRefPattern } from '@/pipeline/targets/openapi/options/ref-patterns';
import type { OpenApiRef, RefResolver } from './ref-resolver.types';

export function toOpenApiSchemaRef(ref: EngineRef, resolver: RefResolver): OpenApiRef {
  const schemaName = resolver.schemas.get(ref.id);

  if (!schemaName) {
    throw new Error(`Unable to resolve OpenAPI schema ref: ${ref.id}`);
  }

  return {
    $ref: `${OpenApiRefPattern.schemas}${schemaName}`,
  };
}
