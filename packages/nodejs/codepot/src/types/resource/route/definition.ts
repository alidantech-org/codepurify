import { Ref } from '../../_shared/ref/definition';
import { DefinitionItem } from '../../definition';
import { RefSchema } from '../../schema/definition';
import { ParamsDefinition } from '../../schema/params/definition';
import { RouteSecurityDefinition } from '../../security/definition';
import { RequestDefinition, ResponseDefinition } from '../../transport/definition';
import { OperationDefinition } from '../operation/definition';

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
// ROUTE METHOD
// ============================================================================

export interface RouteMethodDefinition extends DefinitionItem {
  operation: Ref<OperationDefinition>;
  security?: RouteSecurityDefinition;
  query?: Ref<RefSchema>;
  body?: RequestDefinition;
  responses: Record<number, Ref<ResponseDefinition>>;
}

// ============================================================================
// ROUTE PATH
// ============================================================================

export interface RoutePathDefinition extends DefinitionItem {
  parameters?: Record<string, Ref<ParamsDefinition>>;
  methods: Partial<Record<HttpMethod, RouteMethodDefinition>>;
}

// ============================================================================
// ROUTES
// ============================================================================

export type RoutesDefinition = Record<string, RoutePathDefinition>;
