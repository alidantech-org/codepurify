// src/compiler/resolvers/route-resolver.ts

import type { RoutePathAuthoringDefinition } from '@/contract/types/authoring/7.routes-builder';

import type { ContentDefinition } from '@/contract/types/authoring/content.types';

import type {
  RouteBodyDefinition,
  RouteInlineResponseDefinition,
  RouteMethodDefinition,
  RouteResponseDefinition,
} from '@/contract/types/ir/resource/route/definition';

import type { OperationDefinition } from '@/contract/types/ir/resource/operation/definition';
import type { Ref } from '@/contract/types/ir/ref';
import type { SecurityPolicyDefinition } from '@/contract/types/ir/security/definition';

import type { CompilerContext } from '../context/compiler-context';

import { contentTypeRef, dtoRef, errorResponseRef, modelRef, operationRef, paramsRef, securityPolicyRef } from './ref-resolver';
import { resolveSecurityPolicy } from './security-resolver';

import { normalizeContentList, normalizeContentTypeKey, normalizeOptionalContentList, resolveContentType } from './content-type-resolver';

import { toSnakeCaseKey } from '@/utils/naming/normalize-key';

// ============================================================================
// DERIVED AUTHORING TYPES
// ============================================================================

type AuthoringRouteBody = NonNullable<RoutePathAuthoringDefinition['body']>;

type AuthoringRouteOutput = NonNullable<RoutePathAuthoringDefinition['output']>;

type AuthoringRouteResponses = NonNullable<RoutePathAuthoringDefinition['responses']>;

type AuthoringRouteResponse = AuthoringRouteResponses[number];

// ============================================================================
// INPUTS
// ============================================================================

export interface ResolveRouteInput {
  readonly ctx: CompilerContext;
  readonly resourceKey: string;
  readonly routeKey: string;
  readonly route: RoutePathAuthoringDefinition;
}

export interface ResolvedRoute {
  readonly operationKey: string;
  readonly operation: OperationDefinition;
  readonly method: RouteMethodDefinition;
}

// ============================================================================
// AUTHORING REF HELPERS
// ============================================================================

interface AuthoringRefLike {
  readonly id: string;
  readonly kind: string;
  readonly key: string;
}

interface UsageWrapperLike {
  readonly ref: AuthoringRefLike;
}

/**
 * Checks whether an input value is an authoring ref-like object.
 */
function isAuthoringRef(input: object | null | undefined): input is AuthoringRefLike {
  return (
    input !== null &&
    input !== undefined &&
    'id' in input &&
    typeof input.id === 'string' &&
    'kind' in input &&
    typeof input.kind === 'string' &&
    'key' in input &&
    typeof input.key === 'string'
  );
}

/**
 * Checks whether an input value is a usage wrapper.
 */
function isUsageWrapper(input: object | null | undefined): input is UsageWrapperLike {
  return input !== null && input !== undefined && 'ref' in input && isAuthoringRef(input.ref as object);
}

/**
 * Unwraps route values that may be plain refs or usage wrappers.
 */
function unwrapRefInput(input: object): AuthoringRefLike {
  if (isAuthoringRef(input)) return input;

  if (isUsageWrapper(input)) return input.ref;

  throw new Error('Expected authoring ref or usage wrapper.');
}

// ============================================================================
// ROUTE BODY / OUTPUT SHAPE HELPERS
// ============================================================================

/**
 * Checks whether a route body has a schema.
 */
function hasBodySchema(body: AuthoringRouteBody | null | undefined): body is AuthoringRouteBody & { readonly schema: object } {
  return (
    body !== null &&
    body !== undefined &&
    typeof body === 'object' &&
    'schema' in body &&
    typeof body.schema === 'object' &&
    body.schema !== null
  );
}

/**
 * Reads optional content from any route body/output/response object.
 *
 * Some narrowed route shapes only prove `schema` or `status`, so this helper
 * must not require the input type to already declare a `content` property.
 */
function getContent(input: object | null | undefined): ContentDefinition | readonly ContentDefinition[] | undefined {
  if (input !== null && input !== undefined && 'content' in input) {
    return input.content as ContentDefinition | readonly ContentDefinition[] | undefined;
  }

  return undefined;
}

/**
 * Checks whether a route output has a schema.
 */
function hasOutputSchema(output: AuthoringRouteOutput | null | undefined): output is AuthoringRouteOutput & {
  readonly status: number;
  readonly schema: object;
} {
  return (
    output !== null &&
    output !== undefined &&
    typeof output === 'object' &&
    'status' in output &&
    typeof output.status === 'number' &&
    'schema' in output &&
    typeof output.schema === 'object' &&
    output.schema !== null
  );
}

/**
 * Checks whether a route output is a valid status-only response.
 */
function hasOutputStatus(output: AuthoringRouteOutput | null | undefined): output is AuthoringRouteOutput & { readonly status: number } {
  return output !== null && output !== undefined && typeof output === 'object' && 'status' in output && typeof output.status === 'number';
}

/**
 * Checks whether an inline response has a schema.
 */
function hasInlineResponseSchema(response: AuthoringRouteResponse): response is AuthoringRouteResponse & {
  readonly schema: object;
  readonly content?: ContentDefinition | readonly ContentDefinition[];
} {
  return (
    response !== null &&
    typeof response === 'object' &&
    'schema' in response &&
    typeof response.schema === 'object' &&
    response.schema !== null
  );
}

/**
 * Reads an inline response status.
 */
function getInlineResponseStatus(response: AuthoringRouteResponse): number | undefined {
  if (response !== null && typeof response === 'object' && 'status' in response && typeof response.status === 'number') {
    return response.status;
  }

  return undefined;
}

/**
 * Reads inline response headers.
 */
function getInlineResponseHeaders(response: AuthoringRouteResponse): Record<string, object> | undefined {
  if (
    response !== null &&
    typeof response === 'object' &&
    'headers' in response &&
    response.headers !== null &&
    typeof response.headers === 'object'
  ) {
    return response.headers as Record<string, object>;
  }

  return undefined;
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

/**
 * Registers a route content descriptor in IR and returns its content type ref.
 */
function registerRouteContentType(ctx: CompilerContext, content: ContentDefinition): Ref {
  const key = normalizeContentTypeKey(content);

  ctx.ir.content_types[key] = resolveContentType(content);

  return contentTypeRef(key);
}

/**
 * Resolves required route content into the primary content type ref.
 */
function resolveRequiredContentType(ctx: CompilerContext, content?: ContentDefinition | readonly ContentDefinition[]): Ref {
  const [first] = normalizeContentList(content);

  return registerRouteContentType(ctx, first);
}

/**
 * Resolves optional route content descriptors into content type refs.
 */
function resolveOptionalContentTypes(
  ctx: CompilerContext,
  content?: ContentDefinition | readonly ContentDefinition[],
): readonly Ref[] | undefined {
  const list = normalizeOptionalContentList(content);

  if (list === undefined) return undefined;

  return list.map((item) => registerRouteContentType(ctx, item));
}

// ============================================================================
// SCHEMA REFS
// ============================================================================

/**
 * Resolves an authoring schema ref into an IR schema ref.
 */
function resolveRouteSchemaRef(input: object): Ref {
  const value = unwrapRefInput(input);

  if (value.kind === 'schema.dto') {
    return dtoRef(toSnakeCaseKey(value.key));
  }

  if (value.kind === 'schema.model') {
    return modelRef(toSnakeCaseKey(value.key));
  }

  throw new Error(`Unsupported route schema ref kind "${value.kind}".`);
}

/**
 * Resolves an authoring params ref into an IR params ref.
 */
function resolveRouteParamsRef(input: object): Ref {
  const value = unwrapRefInput(input);

  if (value.kind === 'schema.params') {
    return paramsRef(toSnakeCaseKey(value.key));
  }

  throw new Error(`Unsupported route params ref kind "${value.kind}".`);
}

/**
 * Checks whether a route security value is an inline security policy.
 */
function isInlineSecurityPolicy(input: object | null | undefined): input is { readonly mode: SecurityPolicyDefinition['mode'] } {
  return input !== null && input !== undefined && 'mode' in input && typeof input.mode === 'string';
}

/**
 * Resolves route security into either a security policy ref or inline policy.
 *
 * Authoring supports both:
 * - security.ref.tenantAdmin
 * - security.protected()
 */
function resolveRouteSecurity(input: object): Ref | SecurityPolicyDefinition {
  if (isAuthoringRef(input) || isUsageWrapper(input)) {
    const value = unwrapRefInput(input);

    if (value.kind === 'security.policy') {
      return securityPolicyRef(toSnakeCaseKey(value.key));
    }

    throw new Error(`Unsupported route security ref kind "${value.kind}".`);
  }

  if (isInlineSecurityPolicy(input)) {
    return resolveSecurityPolicy({
      key: 'inline',
      policy: input as never,
    });
  }

  throw new Error('Route security must be a security policy ref or inline security policy.');
}

/**
 * Resolves an authoring error ref into an IR error response ref.
 */
function resolveRouteErrorRef(resourceKey: string, input: object): Ref {
  const value = unwrapRefInput(input);

  if (value.kind !== 'error') {
    throw new Error(`Unsupported route error ref kind "${value.kind}".`);
  }

  const rawKey = String(value.key);
  const globalKey = toSnakeCaseKey(rawKey);
  const resourceScopedKey = toSnakeCaseKey(`${resourceKey}_${rawKey}`);

  if (globalKey in value) {
    return errorResponseRef(globalKey);
  }

  return errorResponseRef(resourceScopedKey);
}

// ============================================================================
// BODY / OUTPUT
// ============================================================================

/**
 * Resolves an authoring route body into an IR route body.
 */
function resolveRouteBody(ctx: CompilerContext, body: AuthoringRouteBody | null | undefined): RouteBodyDefinition | undefined {
  if (!hasBodySchema(body)) return undefined;

  return {
    schema: resolveRouteSchemaRef(body.schema),
    content_type: resolveRequiredContentType(ctx, getContent(body)),
  };
}

/**
 * Resolves an authoring route output into an IR route response-like output.
 */
function resolveRouteOutput(
  ctx: CompilerContext,
  output: AuthoringRouteOutput | null | undefined,
): RouteInlineResponseDefinition | undefined {
  if (!hasOutputStatus(output)) return undefined;

  if (!hasOutputSchema(output)) {
    return {
      status: output.status,
    };
  }

  return {
    status: output.status,
    schema: resolveRouteSchemaRef(output.schema),
    content_type: resolveRequiredContentType(ctx, getContent(output)),
  };
}

/**
 * Resolves an inline authoring response into an IR route response.
 */
function resolveInlineResponse(ctx: CompilerContext, response: AuthoringRouteResponse): RouteInlineResponseDefinition {
  const output: RouteInlineResponseDefinition = {
    ...(getInlineResponseStatus(response) !== undefined ? { status: getInlineResponseStatus(response) } : {}),
  };

  if (hasInlineResponseSchema(response)) {
    output.schema = resolveRouteSchemaRef(response.schema);
    output.content_type = resolveRequiredContentType(ctx, getContent(response));
  }

  const headers = getInlineResponseHeaders(response);

  if (headers !== undefined) {
    output.headers = Object.fromEntries(
      Object.entries(headers).map(([key, schema]) => [toSnakeCaseKey(key), resolveRouteSchemaRef(schema)]),
    );
  }

  return output;
}

/**
 * Resolves a route response entry.
 */
function resolveRouteResponse(ctx: CompilerContext, resourceKey: string, response: AuthoringRouteResponse): RouteResponseDefinition {
  if (response !== null && typeof response === 'object' && isAuthoringRef(response)) {
    return resolveRouteErrorRef(resourceKey, response);
  }

  return resolveInlineResponse(ctx, response);
}

// ============================================================================
// OPERATION
// ============================================================================

/**
 * Creates a stable operation key from the authoring route key.
 */
export function createRouteOperationKey(routeKey: string): string {
  return toSnakeCaseKey(routeKey);
}

/**
 * Derives an IR operation definition from an authoring route.
 */
function resolveOperation(resourceKey: string, route: RoutePathAuthoringDefinition): OperationDefinition {
  const input: OperationDefinition['input'] = {};
  const output: OperationDefinition['output'] = {};

  if (route.params !== undefined && route.params !== null) {
    input.params = resolveRouteParamsRef(route.params as object) as OperationDefinition['input']['params'];
  }

  if (route.query !== undefined && route.query !== null) {
    input.query = resolveRouteSchemaRef(route.query as object) as OperationDefinition['input']['query'];
  }

  if (hasBodySchema(route.body)) {
    input.body = resolveRouteSchemaRef(route.body.schema) as OperationDefinition['input']['body'];
  }

  if (hasOutputSchema(route.output)) {
    output.result = resolveRouteSchemaRef(route.output.schema) as OperationDefinition['output']['result'];
  }

  if (route.errors !== undefined) {
    output.errors = route.errors.map((error) =>
      resolveRouteErrorRef(resourceKey, error as object),
    ) as OperationDefinition['output']['errors'];
  }

  return {
    input,
    output,
  };
}

// ============================================================================
// RESPONSES
// ============================================================================

/**
 * Builds the route method response map from output, errors, and explicit
 * response overrides.
 */
function resolveResponses(
  ctx: CompilerContext,
  resourceKey: string,
  route: RoutePathAuthoringDefinition,
): RouteMethodDefinition['responses'] {
  const responses: RouteMethodDefinition['responses'] = {};

  const output = resolveRouteOutput(ctx, route.output);

  if (output !== undefined) {
    responses[output.status ?? 200] = output;
  }

  for (const error of route.errors ?? []) {
    const errorRef = resolveRouteErrorRef(resourceKey, error as object);
    responses[400] = errorRef;
  }

  for (const [status, response] of Object.entries(route.responses ?? {})) {
    responses[Number(status)] = resolveRouteResponse(ctx, resourceKey, response as AuthoringRouteResponse);
  }

  return responses;
}

// ============================================================================
// RESOLVE
// ============================================================================

/**
 * Resolves one authoring route into a compiled route method and compiler-created
 * operation definition.
 */
export function resolveRoute(input: ResolveRouteInput): ResolvedRoute {
  const { ctx, resourceKey, routeKey, route } = input;
  const operationKey = createRouteOperationKey(routeKey);

  return {
    operationKey,
    operation: resolveOperation(resourceKey, route),
    method: {
      operation: operationRef(toSnakeCaseKey(resourceKey), operationKey),

      ...(route.security !== undefined && route.security !== null ? { security: resolveRouteSecurity(route.security as object) } : {}),

      ...(route.params !== undefined && route.params !== null ? { params: resolveRouteParamsRef(route.params as object) } : {}),

      ...(route.query !== undefined && route.query !== null ? { query: resolveRouteSchemaRef(route.query as object) } : {}),

      ...(resolveRouteBody(ctx, route.body) !== undefined ? { body: resolveRouteBody(ctx, route.body) } : {}),

      responses: resolveResponses(ctx, resourceKey, route),
    },
  };
}
