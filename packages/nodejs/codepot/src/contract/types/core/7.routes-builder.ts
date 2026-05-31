import type { DefinitionItem } from '@/contract/types/definition';

import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { HttpMethod, RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';

import type {
  DtoAuthoringRef,
  EntityFieldAuthoringRef,
  MaybeUsage,
  ModelAuthoringRef,
  OperationAuthoringRef,
  ParamsAuthoringRef,
  PropertyAuthoringRef,
  RequestAuthoringRef,
  ResponseAuthoringRef,
  RouteAuthoringRef,
} from './3.authoring-ref';

import type { ParamSourceRef, ParamsInputMap, ParamsResult } from './5.schemas-builder';

import type { RouteSecurityInput } from './9.security-builder';

// ============================================================================
// SHARED ROUTE SCHEMA INPUTS
// ============================================================================

export type RouteSchemaInput = MaybeUsage<DtoAuthoringRef>;

export type RouteQueryInput = RouteSchemaInput;

export type RouteBodyInput = RouteSchemaInput | RequestAuthoringRef;

export type RouteParamValueInput = ParamSourceRef | ParamsAuthoringRef | PropertyAuthoringRef | EntityFieldAuthoringRef;

export type RouteInlineParamsInput = Record<string, RouteParamValueInput>;

export type RouteParamsInput = ParamsInputMap | ParamsResult<ParamsInputMap> | RouteInlineParamsInput;

export type RouteResponseInput = ResponseAuthoringRef | RouteInlineResponseInput;

// ============================================================================
// INLINE REQUEST / RESPONSE INPUTS
// ============================================================================

export interface RouteInlineRequestInput extends DefinitionItem {
  readonly schema: RouteSchemaInput;

  /**
   * MIME type or registered content type key/path.
   */
  readonly contentType?: string;
}

export interface RouteInlineResponseInput extends DefinitionItem {
  readonly schema?: RouteSchemaInput;

  /**
   * MIME type or registered content type key/path.
   */
  readonly contentType?: string;

  readonly headers?: Record<string, RouteSchemaInput>;
}

// ============================================================================
// RESPONSE HELPER
// ============================================================================

export interface RouteResponseHelper {
  json(schema?: RouteSchemaInput, options?: Omit<RouteInlineResponseInput, 'schema' | 'contentType'>): RouteInlineResponseInput;

  text(schema?: RouteSchemaInput, options?: Omit<RouteInlineResponseInput, 'schema' | 'contentType'>): RouteInlineResponseInput;

  binary(options?: Omit<RouteInlineResponseInput, 'schema' | 'contentType'>): RouteInlineResponseInput;

  empty(options?: DefinitionItem): RouteInlineResponseInput;

  contentType(
    contentType: string,
    schema?: RouteSchemaInput,
    options?: Omit<RouteInlineResponseInput, 'schema' | 'contentType'>,
  ): RouteInlineResponseInput;

  ref(ref: ResponseAuthoringRef): ResponseAuthoringRef;
}

// ============================================================================
// REQUEST HELPER
// ============================================================================

export interface RouteRequestHelper {
  json(schema: RouteSchemaInput, options?: Omit<RouteInlineRequestInput, 'schema' | 'contentType'>): RouteInlineRequestInput;

  form(schema: RouteSchemaInput, options?: Omit<RouteInlineRequestInput, 'schema' | 'contentType'>): RouteInlineRequestInput;

  multipart(schema: RouteSchemaInput, options?: Omit<RouteInlineRequestInput, 'schema' | 'contentType'>): RouteInlineRequestInput;

  contentType(
    contentType: string,
    schema: RouteSchemaInput,
    options?: Omit<RouteInlineRequestInput, 'schema' | 'contentType'>,
  ): RouteInlineRequestInput;

  ref(ref: RequestAuthoringRef): RequestAuthoringRef;
}

// ============================================================================
// ROUTE METHOD CHAIN
// ============================================================================

export interface RouteMethodChain extends DefinitionItem {
  readonly method: HttpMethod;

  readonly path: string;

  params(params: RouteParamsInput): RouteMethodChain;

  query(query: RouteQueryInput): RouteMethodChain;

  body(body: RouteBodyInput | RouteInlineRequestInput): RouteMethodChain;

  /**
   * Route-level security override.
   */
  security(security: RouteSecurityInput): RouteMethodChain;

  responses(responses: Record<number, RouteResponseInput>): RouteDefinitionInput;

  operation(operation: OperationAuthoringRef): RouteMethodChain;
}

// ============================================================================
// ROUTE DEFINITION INPUT
// ============================================================================

export interface RouteDefinitionInput extends DefinitionItem {
  readonly method: HttpMethod;

  readonly path: string;

  readonly params?: RouteParamsInput;

  readonly query?: RouteQueryInput;

  readonly body?: RouteBodyInput | RouteInlineRequestInput;

  readonly security?: RouteSecurityInput;

  readonly responses: Record<number, RouteResponseInput>;

  /**
   * Optional explicit operation ref.
   * Usually compiler creates operation from route facts.
   */
  readonly operation?: OperationAuthoringRef;
}

export type DefineRoutesFactoryInput = Record<string, RouteDefinitionInput>;

// ============================================================================
// ROUTE HELPER
// ============================================================================

export interface RouteHelper {
  readonly response: RouteResponseHelper;

  readonly request: RouteRequestHelper;

  get(path: string): RouteMethodChain;

  post(path: string): RouteMethodChain;

  put(path: string): RouteMethodChain;

  patch(path: string): RouteMethodChain;

  delete(path: string): RouteMethodChain;

  options(path: string): RouteMethodChain;

  head(path: string): RouteMethodChain;
}

export type DefineRoutesInput = DefineRoutesFactoryInput | ((route: RouteHelper) => DefineRoutesFactoryInput);

// ============================================================================
// ROUTES BUILDER STATE
// ============================================================================

export interface RoutesAuthoringState {
  readonly routes: RoutesDefinition;

  readonly operations: Record<string, OperationDefinition>;
}

// ============================================================================
// ROUTES BUILDER RESULT
// ============================================================================

export interface RoutesBuilderResult<TInput extends DefineRoutesFactoryInput> {
  readonly routes: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: RouteAuthoringRef;
  };
}

// ============================================================================
// ROUTES BUILDER
// ============================================================================

export interface RoutesBuilder {
  readonly state: RoutesAuthoringState;

  define<TInput extends DefineRoutesFactoryInput>(routes: TInput): RoutesBuilderResult<TInput>;

  define<TInput extends DefineRoutesFactoryInput>(factory: (route: RouteHelper) => TInput): RoutesBuilderResult<TInput>;

  addRoute(key: string, route: RoutePathDefinition): RoutesBuilder;

  addOperation(key: string, operation: OperationDefinition): RoutesBuilder;

  snapshot(): RoutesAuthoringState;
}
