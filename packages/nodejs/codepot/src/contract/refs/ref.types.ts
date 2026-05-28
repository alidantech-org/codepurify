import { RefKind } from './ref-kind';
import type { RefUsage, RefWithUsageMethods } from './ref-usage.types';
import type { SchemaFieldMap } from '../schema/schema.types';
import { CodegenMetadata } from '@/pipeline/targets/codegen/codegen-extension.types';

export interface GeneratedEnumPropertySchema {
  readonly kind: 'enum';
  readonly values: readonly string[];
}

export interface GeneratedBooleanPropertySchema {
  readonly kind: 'boolean';
}

export type GeneratedPropertySchema = GeneratedEnumPropertySchema | GeneratedBooleanPropertySchema;

export interface EngineRefBase {
  readonly id: string;
  readonly name: string;
  readonly kind: RefKind;
  readonly meta?: CodegenMetadata;
}

export interface PropertyRef extends EngineRefBase {
  readonly kind: typeof RefKind.property;
  readonly propertyKey: string;
  readonly targetRefId?: string;
  readonly generatedSchema?: GeneratedPropertySchema;
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
  readonly fields: Record<string, RefWithUsageMethods<PropertyRef> | RefUsage<PropertyRef>>;
  readonly sourceFields?: SchemaFieldMap;
  readonly openapiRef?: string;
  readonly inherits?: readonly {
    readonly modelRef: ModelRef;
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
