// src/contract/types/core/7.routes-builder.ts

import type { DefinitionItem } from '@/contract/types/compiled/definition';

import type { OperationDefinition } from '@/contract/types/compiled/resource/operation/definition';
import type { HttpMethod, RoutePathDefinition, RoutesDefinition } from '@/contract/types/compiled/resource/route/definition';

import type {
  DtoAuthoringRef,
  EntityFieldAuthoringRef,
  ErrorAuthoringRef,
  MaybeUsage,
  OperationAuthoringRef,
  ParamsAuthoringRef,
  PropertyAuthoringRef,
  RouteAuthoringRef,
} from './3.authoring-ref';

import type { ContentHelper, ContentInput, ContentInputList } from './8.errors-builder';

import type { ParamSourceRef, ParamsInputMap, ParamsResult } from './5.schemas-builder';

import type { RouteSecurityInput } from './9.security-builder';

// ============================================================================
// SHARED ROUTE SCHEMA INPUTS
// ============================================================================

export type RouteSchemaInput = MaybeUsage<DtoAuthoringRef>;

export type RouteQueryInput = RouteSchemaInput;

export type RouteBodyInput = RouteSchemaInput;

export type RouteParamValueInput = ParamSourceRef | ParamsAuthoringRef | PropertyAuthoringRef | EntityFieldAuthoringRef;

export type RouteInlineParamsInput = Record<string, RouteParamValueInput>;

export type RouteParamsInput = ParamsAuthoringRef | ParamsInputMap | ParamsResult<ParamsInputMap> | RouteInlineParamsInput;

// ============================================================================
// ROUTE OUTPUT / ERRORS
// ============================================================================

export interface RouteOutputOptions extends DefinitionItem {
  readonly status?: number;
  readonly content?: ContentInputList;
}

export interface RouteOutputInput extends DefinitionItem {
  readonly status: number;
  readonly schema?: RouteSchemaInput;
  readonly content?: readonly ContentInput[];
}

export type RouteErrorInput = ErrorAuthoringRef;

// ============================================================================
// LOW-LEVEL ESCAPE HATCH
// ============================================================================

export interface RouteInlineResponseInput extends DefinitionItem {
  readonly status?: number;
  readonly schema?: RouteSchemaInput;
  readonly content?: ContentInputList;
  readonly headers?: Record<string, RouteSchemaInput>;
}

export type RouteResponseInput = ErrorAuthoringRef | RouteInlineResponseInput;

// ============================================================================
// ROUTE METHOD CHAIN
// ============================================================================

export interface RouteMethodChain extends DefinitionItem {
  readonly method: HttpMethod;

  readonly path: string;

  params(params: RouteParamsInput): RouteMethodChain;

  query(query: RouteQueryInput): RouteMethodChain;

  /**
   * Request body. JSON is default unless content is provided.
   */
  body(body: RouteBodyInput, content?: ContentInputList): RouteMethodChain;

  /**
   * Route-level security override.
   */
  security(security: RouteSecurityInput): RouteMethodChain;

  /**
   * Success output. Defaults to status 200 and JSON content.
   */
  output(schema: RouteSchemaInput, contentOrOptions?: ContentInputList | RouteOutputOptions): RouteDefinitionInput;

  /**
   * Created output. Defaults to status 201 and JSON content.
   */
  created(schema: RouteSchemaInput, contentOrOptions?: ContentInputList | RouteOutputOptions): RouteDefinitionInput;

  /**
   * No body success output. Defaults to status 204.
   */
  noContent(options?: Omit<RouteOutputOptions, 'content'>): RouteDefinitionInput;

  /**
   * Semantic reusable errors.
   */
  errors(...errors: readonly RouteErrorInput[]): RouteMethodChain;

  /**
   * Low-level HTTP escape hatch. Prefer output/created/noContent/errors.
   */
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

  readonly body?: {
    readonly schema: RouteBodyInput;
    readonly content?: readonly ContentInput[];
  };

  readonly security?: RouteSecurityInput;

  readonly output?: RouteOutputInput;

  readonly errors?: readonly RouteErrorInput[];

  /**
   * Low-level HTTP escape hatch.
   */
  readonly responses?: Record<number, RouteResponseInput>;

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
  readonly content: ContentHelper;

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
