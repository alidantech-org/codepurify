import type { ComponentRef, ModelRef, ParameterRef, RequestBodyRef, ResponseRef, PropertyRef } from '../refs/ref.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';
import type { RefWithUsageMethods, RefUsage } from '../refs/ref-usage.types.js';
import type { SchemaField } from '../schema/schema.types.js';
import type { HttpMethod } from './http-method.js';
import type { CodegenMetadata, CodegenUiInput } from '../codegen/codegen-extension.types.js';
import type { ContentTypeInput } from '../openapi/content-type.js';

// Legacy types - kept for backward compatibility
export type RouteSchemaRef = ComponentRef | ModelRef | ComponentFieldMap;

export type RouteRequestBodyRef = RequestBodyRef | RouteSchemaRef;

export type RouteResponseRef = ResponseRef | RouteSchemaRef;

export type RouteParameterRef = ParameterRef | ComponentFieldMap;

export type RouteParameterInput = ParameterRef | readonly ParameterRef[] | ComponentFieldMap;

export type RouteParameterRegistry = Record<string, RouteParameterFieldValue>;

// Route query field values must be property refs, not component/model refs
// A route query can be a ComponentRef at the top level, but expanded fields must be PropertyRef
export type RouteParameterFieldValue = PropertyRef | RefUsage<PropertyRef>;

export type RouteQueryInput = RouteParameterMap | RefWithUsageMethods<ComponentRef> | RefUsage<ComponentRef>;

export type RouteParameterMap = Record<string, RouteParameterFieldValue>;

export type RouteSchemaInput =
  | PropertyRef
  | ComponentRef
  | ModelRef
  | RefUsage<PropertyRef>
  | RefUsage<ComponentRef>
  | RefUsage<ModelRef>
  | SchemaField;

export interface RouteBodyObjectInput {
  readonly schema: RouteSchemaInput;
  readonly required?: boolean;
  readonly description?: string;
  readonly contentType?: ContentTypeInput;
}

export type RouteBodyInput = RouteSchemaInput | RouteBodyObjectInput;

export interface RouteResponseObjectInput {
  readonly schema: RouteSchemaInput;
  readonly description?: string;
  readonly contentType?: ContentTypeInput;
}

export type RouteResponseInput = RouteSchemaInput | RouteResponseObjectInput;

export interface RouteDefinition {
  readonly method: HttpMethod;
  readonly path: string;
  readonly summary?: string;
  readonly description?: string;

  readonly params?: RouteParameterMap;
  readonly query?: RouteQueryInput;
  readonly body?: RouteBodyInput;

  readonly response?: RouteResponseInput;
  readonly responses?: Record<number, RouteResponseInput>;

  readonly operationId?: string;
  readonly tags?: string[];
  readonly meta?: CodegenMetadata;
  readonly ui?: CodegenUiInput;
}

export type DefineRoutesInput =
  | Record<string, RouteDefinition>
  | {
      readonly parameters?: RouteParameterRegistry;
      readonly routes: Record<string, RouteDefinition>;
    };

export type DefineRoutesBuilderInput = (builder: RoutesBuilder) => RoutesBuilder | void;

export type DefineRoutesInputLike = DefineRoutesInput | DefineRoutesBuilderInput;

export interface RoutesBuilder {
  params(parameters: RouteParameterRegistry): RoutesBuilder;
  get(path: string, name: string): RoutesBuilder;
  post(path: string, name: string): RoutesBuilder;
  put(path: string, name: string): RoutesBuilder;
  patch(path: string, name: string): RoutesBuilder;
  delete(path: string, name: string): RoutesBuilder;
  summary(summary: string): RoutesBuilder;
  description(description: string): RoutesBuilder;
  query(query: RouteQueryInput): RoutesBuilder;
  body(body: RouteBodyInput): RoutesBuilder;
  response(response: RouteResponseInput): RoutesBuilder;
  on(status: number, response: RouteResponseInput): RoutesBuilder;
  ui(roleOrMeta: CodegenUiInput): RoutesBuilder;
  done(): RoutesBuilder;
  build(): {
    parameters?: RouteParameterRegistry;
    routes: Record<string, RouteDefinition>;
  };
}

export interface RouteRegistry {
  readonly name: string;
  readonly routes: Record<string, RouteDefinition>;
  readonly parameters?: RouteParameterRegistry;
}

export function extractPathParamNames(path: string): readonly string[] {
  const matches = path.matchAll(/:([A-Za-z_][A-Za-z0-9_]*)/g);
  return Array.from(matches, (match) => match[1]);
}
