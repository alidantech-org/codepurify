// src/contract/types/compiled/resource/route/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { ContentTypeDefinition } from '../../content/definition';
import type { ErrorResponseDefinition } from '../../response/errors/definition';
import type { DtoDefinition } from '../../schema/dto/definition';
import type { ModelDefinition } from '../../schema/model/definition';
import type { ParamsDefinition } from '../../schema/params/definition';
import type { SecurityPolicyDefinition } from '../../security/definition';
import type { OperationDefinition } from '../operation/definition';

// ============================================================================
// HTTP METHOD
// ============================================================================

export const HttpMethod = {
  get: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  delete: 'delete',
  options: 'options',
  head: 'head',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

// ============================================================================
// ROUTE SCHEMA / CONTENT
// ============================================================================

export type RouteSchemaRef = Ref<DtoDefinition> | Ref<ModelDefinition>;

export interface RouteBodyDefinition extends DefinitionItem {
  readonly schema: RouteSchemaRef;
  readonly content_type: Ref<ContentTypeDefinition>;
}

export interface RouteOutputDefinition extends DefinitionItem {
  readonly status: number;
  readonly schema?: RouteSchemaRef;
  readonly content_type?: Ref<ContentTypeDefinition>;
}

export interface RouteInlineResponseDefinition extends DefinitionItem {
  readonly status?: number;
  readonly schema?: RouteSchemaRef;
  readonly content_type?: Ref<ContentTypeDefinition>;
  readonly headers?: Record<string, RouteSchemaRef>;
}

export type RouteResponseDefinition = Ref<ErrorResponseDefinition> | RouteInlineResponseDefinition;

// ============================================================================
// ROUTE METHOD
// ============================================================================

export interface RouteMethodDefinition extends DefinitionItem {
  readonly operation: Ref<OperationDefinition>;

  readonly security?: Ref<SecurityPolicyDefinition>;

  readonly params?: Ref<ParamsDefinition>;
  readonly query?: RouteSchemaRef;
  readonly body?: RouteBodyDefinition;

  /**
   * Response map keyed by HTTP status code.
   */
  readonly responses: Record<number, RouteResponseDefinition>;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Route map:
 *
 * routes:
 *   /users:
 *     get: ...
 *     post: ...
 */
export type RoutesDefinition = Record<string, Partial<Record<HttpMethod, RouteMethodDefinition>>>;
