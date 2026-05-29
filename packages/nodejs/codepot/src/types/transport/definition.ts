import { Ref } from '../_shared/ref/definition';
import { DefinitionItem } from '../definition';
import { RefSchema } from '../schema/definition';

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
  value: string;
  strategy: ContentTypeStrategy;
}

export interface RequestDefinition extends DefinitionItem {
  schema: Ref<RefSchema>;
  contentType: Ref<ContentTypeDefinition>;
}

export interface ResponseHeaderDefinition extends DefinitionItem {
  description?: string;
  schema: Ref<RefSchema>;
  required: boolean;
}

export interface ResponseDefinition extends DefinitionItem {
  schema: Ref<RefSchema>;
  contentType: Ref<ContentTypeDefinition>;
  headers?: Record<string, ResponseHeaderDefinition>;
}

export interface TransportRequestsDefinition<TRequest = RequestDefinition> {
  custom: Record<string, TRequest>;
  metadata?: Record<string, unknown>;
}

export interface TransportResponsesDefinition<TResponse = ResponseDefinition> {
  defaults: Record<number, Ref<TResponse>>;
  custom: Record<string, TResponse>;
  metadata?: Record<string, unknown>;
}

export interface TransportDefaultsDefinition<TContentType = ContentTypeDefinition> {
  requestContentType?: Ref<TContentType>;
  responseContentType?: Ref<TContentType>;
  metadata?: Record<string, unknown>;
}

export interface TransportDefinition {
  contentTypes: Record<string, ContentTypeDefinition>;
  requests: TransportRequestsDefinition;
  responses: TransportResponsesDefinition;
  defaults?: TransportDefaultsDefinition;
  metadata?: Record<string, unknown>;
}
