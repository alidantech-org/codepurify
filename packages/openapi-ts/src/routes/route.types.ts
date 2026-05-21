import type { ComponentRef, ModelRef, ParameterRef, RequestBodyRef, ResponseRef } from '../refs/ref.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';
import type { HttpMethod } from './http-method.js';
import type { SdkExtensionMeta } from '../sdk/sdk-extension.types.js';

export type RouteSchemaRef = ComponentRef | ModelRef | ComponentFieldMap;

export type RouteRequestBodyRef = RequestBodyRef | RouteSchemaRef;

export type RouteResponseRef = ResponseRef | RouteSchemaRef;

export type RouteParameterRef = ParameterRef | ComponentFieldMap;

export type RouteParameterInput = ParameterRef | readonly ParameterRef[] | ComponentFieldMap;

export type RoutePathParameterMap = Record<string, readonly ParameterRef[]>;

export interface RouteDefinition {
  readonly method: HttpMethod;
  readonly path: string;
  readonly summary?: string;
  readonly description?: string;

  readonly params?: RouteParameterInput;
  readonly query?: RouteParameterInput;
  readonly parameters?: readonly ParameterRef[];
  readonly body?: RouteRequestBodyRef;

  readonly response?: RouteResponseRef;
  readonly responses?: Record<number, RouteResponseRef>;

  readonly operationId?: string;
  readonly tags?: string[];
  readonly meta?: SdkExtensionMeta;
}

export type DefineRoutesInput =
  | Record<string, RouteDefinition>
  | {
      readonly parameters?: RoutePathParameterMap;
      readonly routes: Record<string, RouteDefinition>;
    };

export interface RouteRegistry {
  readonly name: string;
  readonly routes: Record<string, RouteDefinition>;
  readonly parameters?: RoutePathParameterMap;
}
