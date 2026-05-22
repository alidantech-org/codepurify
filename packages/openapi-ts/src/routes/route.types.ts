import type { ComponentRef, ModelRef, ParameterRef, RequestBodyRef, ResponseRef, PropertyRef } from '../refs/ref.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';
import type { RefWithUsageMethods, RefUsage } from '../refs/ref-usage.types.js';
import type { SchemaField } from '../schema/schema.types.js';
import type { HttpMethod } from './http-method.js';
import type { SdkExtensionMeta } from '../sdk/sdk-extension.types.js';
import type { ContentTypeInput } from '../openapi/content-type.js';

// Legacy types - kept for backward compatibility
export type RouteSchemaRef = ComponentRef | ModelRef | ComponentFieldMap;

export type RouteRequestBodyRef = RequestBodyRef | RouteSchemaRef;

export type RouteResponseRef = ResponseRef | RouteSchemaRef;

export type RouteParameterRef = ParameterRef | ComponentFieldMap;

export type RouteParameterInput = ParameterRef | readonly ParameterRef[] | ComponentFieldMap;

export type RoutePathParameterMap = Record<string, RouteParameterMap>;

// New types for direct schema/ref usage
export type RouteParameterFieldValue = PropertyRef | RefUsage<PropertyRef>;

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
  readonly query?: RouteParameterMap;
  readonly body?: RouteBodyInput;

  readonly response?: RouteResponseInput;
  readonly responses?: Record<number, RouteResponseInput>;

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
  readonly parameters?: RoutePathParameterMap; // Keep old type for backward compatibility
  readonly parameterMaps?: Record<string, RouteParameterMap>; // New type for direct parameter maps
}
