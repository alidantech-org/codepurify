import { Ref } from '../ref/definition';

export type ContentTypeStrategy = 'json' | 'multipart' | 'form' | 'text' | 'binary';

export interface ContentTypeDefinition {
  value: string;
  strategy: ContentTypeStrategy;
  metadata?: Record<string, unknown>;
}

export interface ResponseHeaderDefinition<TSchema = unknown> {
  description?: string;
  schema: Ref<TSchema>;
  required?: boolean;
  deprecated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ResponseDefinition<TSchema = unknown, TContentType = ContentTypeDefinition> {
  description?: string;
  schema: Ref<TSchema>;
  contentType: Ref<TContentType>;
  headers?: Record<string, ResponseHeaderDefinition>;
  metadata?: Record<string, unknown>;
}

export interface ResponsesDefinition<TResponse = ResponseDefinition> {
  defaults?: Record<number, Ref<TResponse>>;
  custom: Record<string, TResponse>;
  metadata?: Record<string, unknown>;
}

export type RouteResponsesDefinition<TResponse = ResponseDefinition> = Record<number, Ref<TResponse>>;
