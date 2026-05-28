import type { ModelRef } from '@/contract/refs/ref.types';
import type { FieldSourceMetadata, RefUsage } from '@/contract/refs/ref-usage.types';
import type { RouteBodyInput, RouteParameterFieldValue, RouteResponseInput, RouteSchemaInput } from '@/contract/routes/route.types';
import { ContentTypeInput } from '@/pipeline/targets/openapi/options/content-type';

export type InferredQueryParameterSchema = RouteParameterFieldValue | ModelRef | RefUsage<ModelRef>;

export interface InferredParameterComponent {
  readonly name: string;
  readonly parameterName: string;
  readonly in: 'path' | 'query';
  readonly required: boolean;
  readonly schema: InferredQueryParameterSchema;
  readonly resourceKey?: string;
  readonly operationId?: string;
  readonly source?: FieldSourceMetadata;
}

export interface InferredRequestBodyComponent {
  readonly name: string;
  readonly required: boolean;
  readonly schema: RouteBodyInput | RouteSchemaInput;
  readonly description?: string;
  readonly contentType: ContentTypeInput;
  readonly resourceKey?: string;
  readonly operationId: string;
}

export interface InferredResponseComponent {
  readonly name: string;
  readonly status: number;
  readonly schema?: RouteResponseInput | RouteSchemaInput;
  readonly description: string;
  readonly contentType?: ContentTypeInput;
  readonly resourceKey?: string;
  readonly operationId: string;
  readonly noContent?: boolean;
}

export interface InferredRouteComponents {
  readonly parameters: Map<string, InferredParameterComponent>;
  readonly requestBodies: Map<string, InferredRequestBodyComponent>;
  readonly responses: Map<string, InferredResponseComponent>;
}
