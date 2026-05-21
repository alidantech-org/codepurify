import type { OpenApiVersion } from './openapi-version';

export interface OpenApiDocument {
  openapi: OpenApiVersion;
  info: OpenApiInfo;
  servers?: OpenApiServer[];
  paths: OpenApiPaths;
  components: OpenApiComponents;
}

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
}

export type OpenApiPaths = Record<string, OpenApiPathItem>;

export type OpenApiPathItem = Partial<Record<OpenApiOperationMethod, OpenApiOperation>>;

export type OpenApiOperationMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface OpenApiOperation {
  operationId?: string;
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: unknown[];
  requestBody?: unknown;
  responses: Record<string, unknown>;
  [extension: `x-${string}`]: unknown;
}

export interface OpenApiComponents {
  schemas: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  requestBodies?: Record<string, unknown>;
  responses?: Record<string, unknown>;
}

export interface OpenApiServer {
  url: string;
  description?: string;
}
