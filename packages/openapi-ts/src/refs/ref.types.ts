import { RefKind } from './ref-kind.js';
import type { SdkExtensionMeta } from '../sdk/sdk-extension.types.js';
import type { RefWithUsageMethods } from './ref-usage.types.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';

export interface EngineRefBase {
  readonly id: string;
  readonly name: string;
  readonly kind: RefKind;
  readonly meta?: SdkExtensionMeta;
}

export interface PropertyRef extends EngineRefBase {
  readonly kind: typeof RefKind.property;
  readonly propertyKey: string;
  readonly targetRefId?: string;
}

export interface ComponentRef extends EngineRefBase {
  readonly kind: typeof RefKind.component;
  readonly componentKey: string;
}

export interface ParameterRef extends EngineRefBase {
  readonly kind: typeof RefKind.parameter;
  readonly parameterKey: string;
}

export interface RequestBodyRef extends EngineRefBase {
  readonly kind: typeof RefKind.requestBody;
  readonly requestBodyKey: string;
}

export interface ResponseRef extends EngineRefBase {
  readonly kind: typeof RefKind.response;
  readonly responseKey: string;
}

export interface ModelRef extends EngineRefBase {
  readonly kind: typeof RefKind.model;
  readonly modelKey: string;
  readonly fields: Record<string, RefWithUsageMethods<PropertyRef>>;
  readonly sourceFields?: SchemaFieldMap;
  readonly openapiRef?: string;
  readonly inherits?: {
    readonly ref: string;
    readonly fields: readonly string[];
  }[];
  readonly abstract?: boolean;
}

export interface RouteRef extends EngineRefBase {
  readonly kind: typeof RefKind.route;
  readonly routeKey: string;
}

export interface OperationRef extends EngineRefBase {
  readonly kind: typeof RefKind.operation;
  readonly operationId: string;
}

export type EngineRef = PropertyRef | ComponentRef | ModelRef | ParameterRef | RequestBodyRef | ResponseRef | RouteRef | OperationRef;
