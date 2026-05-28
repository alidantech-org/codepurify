import type { ResponseComponentDefinition } from '@/contract/schema/responses/response-component.types';
import type { ComponentRef, ModelRef, ResponseRef } from '@/contract/refs/ref.types';
import { RefKind } from '@/contract/refs/ref-kind';
import { isRefUsage } from '@/pipeline/validation/ref-usage-guards';
import { compileComponentSchema } from '../schemas/compile-component-schema';
import { resolvePendingRefs } from '../refs/resolve-pending-refs';
import type { RefResolver } from '../refs/ref-resolver.types';
import { ContentType } from '@/app/runtime/output/output.constants';
import { applyCodegenMetadata } from '@/pipeline/targets/codegen/apply-codegen-extensions';
import { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types';

export function compileResponseComponent(definition: ResponseComponentDefinition, resolver: RefResolver): Record<string, unknown> {
  const response: Record<string, unknown> = {
    description: definition.description,
  };

  if (definition.schema) {
    response.content = {
      [ContentType.json]: {
        schema: resolvePendingRefs(toSchema(definition.schema), resolver),
      },
    };
  }

  if (definition.meta) {
    return applyCodegenMetadata(response, definition.meta);
  }

  return response;
}

function toSchema(schema: ResponseComponentDefinition['schema']): unknown {
  if (!schema) return undefined;
  if (isRefUsage(schema)) return { $ref: `#pending/${schema.ref.id}` };
  if (isComponentRef(schema) || isModelRef(schema) || isResponseRef(schema)) return { $ref: `#pending/${schema.id}` };

  return compileComponentSchema({
    name: 'InlineResponseSchema',
    value: schema as ComponentFieldMap,
  });
}

function isComponentRef(value: unknown): value is ComponentRef {
  return isRefKind(value, RefKind.component);
}

function isModelRef(value: unknown): value is ModelRef {
  return isRefKind(value, RefKind.model);
}

function isResponseRef(value: unknown): value is ResponseRef {
  return isRefKind(value, RefKind.response);
}

function isRefKind(value: unknown, kind: RefKind): boolean {
  return !!value && typeof value === 'object' && 'kind' in value && (value as { kind: RefKind }).kind === kind;
}
