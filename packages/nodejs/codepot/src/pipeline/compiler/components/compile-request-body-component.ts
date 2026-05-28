import type { RequestBodyComponentDefinition } from '@/contract/schema/request-bodies/request-body-component.types.js';
import type { ComponentRef, ModelRef, RequestBodyRef } from '@/contract/refs/ref.types.js';
import { RefKind } from '@/contract/refs/ref-kind.js';
import { isRefUsage } from '@/pipeline/validation/ref-usage-guards.js';
import { compileComponentSchema } from '../schemas/compile-component-schema.js';
import { resolvePendingRefs } from '../refs/resolve-pending-refs.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { ContentType } from '@/app/runtime/output/output.constants.js';
import { applyCodegenMetadata } from '@/pipeline/targets/codegen/apply-codegen-extensions.js';
import { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types.js';

export function compileRequestBodyComponent(definition: RequestBodyComponentDefinition, resolver: RefResolver): Record<string, unknown> {
  const body: Record<string, unknown> = {
    required: definition.required ?? true,
    description: definition.description,
    content: {
      [ContentType.json]: {
        schema: resolvePendingRefs(toSchema(definition.schema), resolver),
      },
    },
  };

  if (definition.meta) {
    return applyCodegenMetadata(body, definition.meta);
  }

  return body;
}

function toSchema(schema: RequestBodyComponentDefinition['schema']): unknown {
  if (isRefUsage(schema)) return { $ref: `#pending/${schema.ref.id}` };
  if (isComponentRef(schema) || isModelRef(schema) || isRequestBodyRef(schema)) return { $ref: `#pending/${schema.id}` };

  return compileComponentSchema({
    name: 'InlineRequestBodySchema',
    value: schema as ComponentFieldMap,
  });
}

function isComponentRef(value: unknown): value is ComponentRef {
  return isRefKind(value, RefKind.component);
}

function isModelRef(value: unknown): value is ModelRef {
  return isRefKind(value, RefKind.model);
}

function isRequestBodyRef(value: unknown): value is RequestBodyRef {
  return isRefKind(value, RefKind.requestBody);
}

function isRefKind(value: unknown, kind: RefKind): boolean {
  return !!value && typeof value === 'object' && 'kind' in value && (value as { kind: RefKind }).kind === kind;
}
