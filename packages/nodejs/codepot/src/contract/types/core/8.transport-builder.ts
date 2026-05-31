import type { DefinitionItem } from '@/contract/types/definition';

import type {
  ContentTypeDefinition,
  ContentTypeStrategy,
  RequestDefinition,
  ResponseDefinition,
  TransportDefinition,
} from '@/contract/types/transport/definition';

import type {
  ContentTypeAuthoringRef,
  DtoAuthoringRef,
  MaybeUsage,
  ModelAuthoringRef,
  RequestAuthoringRef,
  ResponseAuthoringRef,
} from './3.authoring-ref';

// ============================================================================
// SHARED TRANSPORT INPUTS
// ============================================================================

export type TransportSchemaInput = MaybeUsage<DtoAuthoringRef>;

export type TransportContentTypeInput = ContentTypeAuthoringRef | string;

// ============================================================================
// CONTENT TYPES
// ============================================================================

export interface ContentTypeInput extends DefinitionItem {
  readonly value: string;
  readonly strategy: ContentTypeStrategy;
}

export type ContentTypeInputMap = Record<string, ContentTypeInput>;

export interface ContentTypesResult<TInput extends ContentTypeInputMap> {
  readonly contentTypes: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: ContentTypeAuthoringRef;
  };
}

// ============================================================================
// REQUESTS
// ============================================================================

export interface RequestInput extends DefinitionItem {
  readonly schema: TransportSchemaInput;
  readonly contentType?: TransportContentTypeInput;
}

export type RequestInputMap = Record<string, RequestInput>;

export interface RequestsResult<TInput extends RequestInputMap> {
  readonly requests: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: RequestAuthoringRef;
  };
}

// ============================================================================
// RESPONSES
// ============================================================================

export type ResponseHeaderInput = TransportSchemaInput;

export interface ResponseInput extends DefinitionItem {
  readonly status: number;

  /**
   * Optional for empty/no-content responses.
   */
  readonly schema?: TransportSchemaInput;

  readonly contentType?: TransportContentTypeInput;

  readonly headers?: Record<string, ResponseHeaderInput>;
}

export type ResponseInputMap = Record<string, ResponseInput>;

export interface ResponsesResult<TInput extends ResponseInputMap> {
  readonly responses: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: ResponseAuthoringRef;
  };
}

// ============================================================================
// DEFAULT RESPONSES
// ============================================================================

export type DefaultResponseInput = ResponseAuthoringRef | ResponseInput;

export type DefaultResponseMap = Record<number, DefaultResponseInput>;

export interface TransportDefaultsInput extends DefinitionItem {
  readonly requestContentType?: TransportContentTypeInput;

  readonly responseContentType?: TransportContentTypeInput;

  /**
   * Default reusable response map.
   * Example:
   * 400 -> BadRequest
   * 401 -> Unauthorized
   * 500 -> InternalServerError
   */
  readonly responses?: DefaultResponseMap;
}

// ============================================================================
// TRANSPORT AUTHORING STATE
// ============================================================================

export interface TransportAuthoringState {
  readonly contentTypes: Record<string, ContentTypeDefinition>;

  readonly requests: Record<string, RequestDefinition>;

  readonly responses: Record<string, ResponseDefinition>;

  readonly defaults?: {
    readonly requestContentType?: TransportContentTypeInput;
    readonly responseContentType?: TransportContentTypeInput;
    readonly responses?: DefaultResponseMap;
  };
}

// ============================================================================
// TRANSPORT HELPERS
// ============================================================================

export interface ContentTypeHelper {
  json(): ContentTypeInput;
  xml(): ContentTypeInput;
  yaml(): ContentTypeInput;
  html(): ContentTypeInput;
  csv(): ContentTypeInput;
  multipart(): ContentTypeInput;
  form(): ContentTypeInput;
  urlencoded(): ContentTypeInput;
  text(): ContentTypeInput;
  binary(): ContentTypeInput;
  stream(): ContentTypeInput;
  graphql(): ContentTypeInput;
  protobuf(): ContentTypeInput;
  msgpack(): ContentTypeInput;

  custom(value: string, strategy: ContentTypeStrategy): ContentTypeInput;
}

export interface RequestHelper {
  json(schema: TransportSchemaInput, options?: Omit<RequestInput, 'schema' | 'contentType'>): RequestInput;

  form(schema: TransportSchemaInput, options?: Omit<RequestInput, 'schema' | 'contentType'>): RequestInput;

  multipart(schema: TransportSchemaInput, options?: Omit<RequestInput, 'schema' | 'contentType'>): RequestInput;

  contentType(
    contentType: TransportContentTypeInput,
    schema: TransportSchemaInput,
    options?: Omit<RequestInput, 'schema' | 'contentType'>,
  ): RequestInput;
}

export interface ResponseHelper {
  json(status: number, schema?: TransportSchemaInput, options?: Omit<ResponseInput, 'status' | 'schema' | 'contentType'>): ResponseInput;

  text(status: number, schema?: TransportSchemaInput, options?: Omit<ResponseInput, 'status' | 'schema' | 'contentType'>): ResponseInput;

  binary(status: number, options?: Omit<ResponseInput, 'status' | 'schema' | 'contentType'>): ResponseInput;

  empty(status: number, options?: Omit<ResponseInput, 'status' | 'schema'>): ResponseInput;

  contentType(
    status: number,
    contentType: TransportContentTypeInput,
    schema?: TransportSchemaInput,
    options?: Omit<ResponseInput, 'status' | 'schema' | 'contentType'>,
  ): ResponseInput;
}

// ============================================================================
// TRANSPORT BUILDER
// ============================================================================

export interface TransportBuilder {
  readonly state: Partial<TransportDefinition>;

  readonly contentType: ContentTypeHelper;

  readonly request: RequestHelper;

  readonly response: ResponseHelper;

  defineContentTypes<TInput extends ContentTypeInputMap>(input: TInput): ContentTypesResult<TInput>;

  defineRequests<TInput extends RequestInputMap>(input: TInput): RequestsResult<TInput>;

  defineResponses<TInput extends ResponseInputMap>(input: TInput): ResponsesResult<TInput>;

  setDefaults(defaults: TransportDefaultsInput): TransportBuilder;

  setDefaultResponses(responses: DefaultResponseMap): TransportBuilder;

  snapshot(): Partial<TransportDefinition>;
}
