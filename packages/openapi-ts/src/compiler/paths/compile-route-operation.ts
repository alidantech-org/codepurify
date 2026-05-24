import type { OpenApiOperation } from '../../openapi/openapi.types.js';
import type {
  RouteDefinition,
  RouteBodyInput,
  RouteResponseInput,
  RouteResponseObjectInput,
  RouteBodyObjectInput,
} from '../../routes/route.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import type { CompilerContext } from '../compiler-context.js';
import { applyCodegenMetadata } from '../../sdk/apply-codegen-extensions.js';
import type { CodegenMetadata } from '../../sdk/codegen-extension.types.js';
import { ContentType } from '../../output/output.constants.js';
import { RefKind } from '../../refs/ref-kind.js';
import type { RequestBodyRef, ResponseRef, ComponentRef } from '../../refs/ref.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { toParameterOpenApiRef, toRequestBodyOpenApiRef, toResponseOpenApiRef } from '../refs/to-component-bucket-ref.js';
import { compileRouteParameters } from './compile-route-parameters.js';
import { compileRouteSchema } from './compile-route-schema.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isComponentRef } from '../../validation/ref-guards.js';

export function compileRouteOperation(
  route: RouteDefinition,
  resolver: RefResolver,
  defaultResponses: Record<number, ResponseRef | RouteResponseInput> = {},
  contract?: VersionContract,
  context?: CompilerContext,
): OpenApiOperation {
  const operation: OpenApiOperation = {
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    responses: compileResponses(route, resolver, defaultResponses),
  };

  const parameters = [
    ...compileRouteParameters(route.params, 'path', resolver, contract),
    ...compileRouteParameters(route.query, 'query', resolver, contract),
  ];

  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  if (route.body) {
    operation.requestBody = compileRequestBody(route.body, resolver);
  }

  if (route.meta) {
    const codegenMeta: CodegenMetadata = route.meta;

    // Add target if route.query is a ComponentRef or RefUsage<ComponentRef>
    if (route.query) {
      let queryRef: ComponentRef | undefined;
      if (isComponentRef(route.query)) {
        queryRef = route.query;
      } else if (isRefUsage(route.query) && isComponentRef(route.query.ref)) {
        queryRef = route.query.ref;
      }

      if (queryRef) {
        const schemaName = resolver.schemas.get(queryRef.id);
        if (schemaName) {
          (codegenMeta as any).target = { $ref: `#/components/schemas/${schemaName}` };
        }
      }
    }

    applyCodegenMetadata(operation as unknown as Record<string, unknown>, codegenMeta);
  }

  return operation;
}

function compileRequestBody(body: RouteBodyInput, resolver: RefResolver): unknown {
  // Handle object-style input
  if (isBodyObjectInput(body)) {
    return {
      required: body.required ?? true,
      description: body.description,
      content: {
        [ContentType.json]: {
          schema: compileRouteSchema(body.schema, resolver),
        },
      },
    };
  }

  // Handle legacy RequestBodyRef
  if (isRequestBodyRef(body)) {
    return toRequestBodyOpenApiRef(body, resolver);
  }

  // Handle direct schema input
  return {
    required: true,
    content: {
      [ContentType.json]: {
        schema: compileRouteSchema(body, resolver),
      },
    },
  };
}

function isBodyObjectInput(body: RouteBodyInput): body is RouteBodyObjectInput {
  return typeof body === 'object' && 'schema' in body;
}

function compileResponses(
  route: RouteDefinition,
  resolver: RefResolver,
  defaultResponses: Record<number, ResponseRef | RouteResponseInput>,
): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  for (const [status, response] of Object.entries(defaultResponses)) {
    if (isResponseRef(response)) {
      responses[status] = toResponseOpenApiRef(response, resolver);
    } else {
      responses[status] = compileResponseValue(`Default ${status}`, response, resolver);
    }
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

function compileResponseValue(description: string, response: RouteResponseInput, resolver: RefResolver): unknown {
  // Handle object-style input
  if (isResponseObjectInput(response)) {
    return jsonResponse(response.description ?? description, compileRouteSchema(response.schema, resolver));
  }

  // Handle legacy ResponseRef
  if (isResponseRef(response)) {
    return toResponseOpenApiRef(response, resolver);
  }

  // Handle direct schema input
  return jsonResponse(description, compileRouteSchema(response, resolver));
}

function isResponseObjectInput(response: RouteResponseInput): response is RouteResponseObjectInput {
  return typeof response === 'object' && 'schema' in response;
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
