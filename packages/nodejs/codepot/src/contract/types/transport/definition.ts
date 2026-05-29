import { Ref } from '../ref';
import { DefinitionItem } from '../definition';
import { RefSchema } from '../schema/definition';

// ============================================================================
// CONTENT TYPE
// ============================================================================

export const ContentTypeStrategy = {
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  html: 'html',
  csv: 'csv',
  multipart: 'multipart',
  form: 'form',
  urlencoded: 'urlencoded',
  text: 'text',
  binary: 'binary',
  stream: 'stream',
  graphql: 'graphql',
  protobuf: 'protobuf',
  msgpack: 'msgpack',
} as const;

export type ContentTypeStrategy = (typeof ContentTypeStrategy)[keyof typeof ContentTypeStrategy];

export interface ContentTypeDefinition extends DefinitionItem {
  /**
   * The MIME type value (e.g., "application/json")
   */
  value: string;

  /**
   * The strategy for handling this content type
   */
  strategy: ContentTypeStrategy;
}

// ============================================================================
// REQUEST / RESPONSE
// ============================================================================

export interface RequestDefinition extends DefinitionItem {
  /**
   * Reference to the request schema
   */
  schema: Ref<RefSchema>;

  /**
   * Reference to the content type for this request
   */
  contentType: Ref<ContentTypeDefinition>;
}

export interface ResponseDefinition extends DefinitionItem {
  /**
   * HTTP status code for this response
   */
  status: number;

  /**
   * Reference to the response schema
   */
  schema: Ref<RefSchema>;

  /**
   * Reference to the content type for this response
   */
  contentType: Ref<ContentTypeDefinition>;

  /**
   * Optional response headers
   */
  headers?: Record<string, Ref<RefSchema>>;
}

// ============================================================================
// TRANSPORT
// ============================================================================

export interface TransportDefinition extends DefinitionItem {
  /**
   * Map of content types by key
   */
  contentTypes: Record<string, ContentTypeDefinition>;

  /**
   * Map of request definitions by key
   */
  requests: Record<string, RequestDefinition>;

  /**
   * Map of response definitions by key
   */
  responses: Record<string, ResponseDefinition>;

  /**
   * Optional default content types for requests and responses
   */
  defaults?: {
    /**
     * Default content type for requests
     */
    requestContentType?: Ref<ContentTypeDefinition>;

    /**
     * Default content type for responses
     */
    responseContentType?: Ref<ContentTypeDefinition>;
  };
}
