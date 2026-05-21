import type { OpenApiOperation } from '../../openapi/openapi.types.js';
import type { RouteDefinition, RouteResponseRef } from '../../routes/route.types.js';
import { applySdkExtensions } from '../../sdk/apply-sdk-extensions.js';
import { ContentType } from '../../output/output.constants.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { ParameterRef, RequestBodyRef, ResponseRef } from '../../refs/ref.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { toParameterOpenApiRef, toRequestBodyOpenApiRef, toResponseOpenApiRef } from '../refs/to-component-bucket-ref.js';
import { compileRouteParameters } from './compile-route-parameters.js';
import { compileRouteSchema } from './compile-route-schema.js';

export function compileRouteOperation(
  route: RouteDefinition,
  resolver: RefResolver,
  defaultResponses: Record<number, ResponseRef> = {},
): OpenApiOperation {
  const operation: OpenApiOperation = {
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    responses: compileResponses(route, resolver, defaultResponses),
  };

  const parameters = [
    ...(route.parameters ?? []).map((ref) => toParameterOpenApiRef(ref, resolver)),
    ...compileRouteParameters(route.params, 'path', resolver),
    ...compileRouteParameters(route.query, 'query', resolver),
  ];

  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  if (route.body) {
    operation.requestBody = isRequestBodyRef(route.body)
      ? toRequestBodyOpenApiRef(route.body, resolver)
      : {
          required: true,
          content: {
            [ContentType.json]: {
              schema: compileRouteSchema(route.body, resolver),
            },
          },
        };
  }

  if (route.meta) {
    // @ts-expect-error
    applySdkExtensions(operation, route.meta);
  }

  return operation;
}

function compileResponses(
  route: RouteDefinition,
  resolver: RefResolver,
  defaultResponses: Record<number, ResponseRef>,
): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  for (const [status, response] of Object.entries(defaultResponses)) {
    responses[status] = toResponseOpenApiRef(response, resolver);
  }

  if (route.response) {
    responses[200] = compileResponseValue('Success', route.response, resolver);
  }

  for (const [status, response] of Object.entries(route.responses ?? {})) {
    responses[status] = compileResponseValue(`Response ${status}`, response, resolver);
  }

  if (Object.keys(responses).length === 0) {
    responses[204] = { description: 'No content' };
  }

  return responses;
}

function compileResponseValue(description: string, response: RouteResponseRef, resolver: RefResolver): unknown {
  if (isResponseRef(response)) return toResponseOpenApiRef(response, resolver);
  return jsonResponse(description, compileRouteSchema(response, resolver));
}

function jsonResponse(description: string, schema: unknown): Record<string, unknown> {
  return {
    description,
    content: {
      [ContentType.json]: {
        schema,
      },
    },
  };
}

function isRequestBodyRef(value: unknown): value is RequestBodyRef {
  return isRefKind(value, RefKind.requestBody);
}

function isResponseRef(value: unknown): value is ResponseRef {
  return isRefKind(value, RefKind.response);
}

function isRefKind(value: unknown, kind: string): boolean {
  return !!value && typeof value === 'object' && 'kind' in value && value.kind === kind;
}
