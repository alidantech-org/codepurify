import { Ref } from '../../ref';
import { DefinitionItem } from '../../definition';
import { RefSchema } from '../../schema/definition';
import { ParamsDefinition } from '../../schema/params/definition';
import { SecurityPolicyDefinition } from '../../security/definition';
import { ContentDefinition } from '../../errors/definition';
import { OperationDefinition } from '../operation/definition';
import { DtoAuthoringRef, ErrorAuthoringRef, MaybeUsage } from '../../core/3.authoring-ref';

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
// ROUTE SCHEMA/CONTENT/ERROR TYPES
// ============================================================================

export type RouteSchemaDefinition = MaybeUsage<DtoAuthoringRef>;

export type RouteContentDefinition = ContentDefinition;

export interface RouteInputDefinition extends DefinitionItem {
  readonly schema: RouteSchemaDefinition;
  readonly content?: readonly RouteContentDefinition[];
}

export interface RouteOutputDefinition extends DefinitionItem {
  readonly status: number;
  readonly schema?: RouteSchemaDefinition;
  readonly content?: readonly RouteContentDefinition[];
}

export type RouteErrorDefinition = ErrorAuthoringRef;

export interface RouteInlineResponseDefinition extends DefinitionItem {
  readonly status?: number;
  readonly schema?: RouteSchemaDefinition;
  readonly content?: readonly RouteContentDefinition[];
  readonly headers?: Record<string, RouteSchemaDefinition>;
}

export type RouteResponseDefinition = ErrorAuthoringRef | RouteInlineResponseDefinition;

// ============================================================================
// ROUTE METHOD
// ============================================================================

export interface RouteMethodDefinition extends DefinitionItem {
  operation: Ref<OperationDefinition>;
  security?: SecurityPolicyDefinition;
  query?: Ref<RefSchema>;
  input?: RouteInputDefinition;
  output?: RouteOutputDefinition;
  errors?: readonly RouteErrorDefinition[];
  responses?: Record<number, RouteResponseDefinition>;
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
