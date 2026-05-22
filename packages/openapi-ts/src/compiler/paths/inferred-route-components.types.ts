import type { RouteParameterFieldValue, RouteSchemaInput } from '../../routes/route.types.js';
import type { ContentTypeInput } from '../../openapi/content-type.js';

export interface InferredParameterComponent {
  readonly name: string;
  readonly parameterName: string;
  readonly in: 'path' | 'query';
  readonly required: boolean;
  readonly schema: RouteParameterFieldValue;
  readonly resourceKey?: string;
  readonly operationId?: string;
}

export interface InferredRequestBodyComponent {
  readonly name: string;
  readonly required: boolean;
  readonly schema: RouteSchemaInput;
  readonly description?: string;
  readonly contentType: ContentTypeInput;
  readonly resourceKey?: string;
  readonly operationId: string;
}

export interface InferredResponseComponent {
  readonly name: string;
  readonly status: number;
  readonly schema?: RouteSchemaInput;
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
