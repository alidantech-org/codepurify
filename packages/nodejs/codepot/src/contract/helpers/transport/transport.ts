import { ContentTypeStrategy } from '@/contract/types/transport/definition';

import type { ContentTypeHelper, RequestHelper, ResponseHelper } from '@/contract/types/core/8.transport-builder';

// ============================================================================
// CONTENT TYPE HELPERS
// ============================================================================

export const contentType: ContentTypeHelper = {
  json() {
    return {
      value: 'application/json',
      strategy: ContentTypeStrategy.json,
    };
  },

  xml() {
    return {
      value: 'application/xml',
      strategy: ContentTypeStrategy.xml,
    };
  },

  yaml() {
    return {
      value: 'application/yaml',
      strategy: ContentTypeStrategy.yaml,
    };
  },

  html() {
    return {
      value: 'text/html',
      strategy: ContentTypeStrategy.html,
    };
  },

  csv() {
    return {
      value: 'text/csv',
      strategy: ContentTypeStrategy.csv,
    };
  },

  multipart() {
    return {
      value: 'multipart/form-data',
      strategy: ContentTypeStrategy.multipart,
    };
  },

  form() {
    return {
      value: 'application/x-www-form-urlencoded',
      strategy: ContentTypeStrategy.form,
    };
  },

  urlencoded() {
    return {
      value: 'application/x-www-form-urlencoded',
      strategy: ContentTypeStrategy.urlencoded,
    };
  },

  text() {
    return {
      value: 'text/plain',
      strategy: ContentTypeStrategy.text,
    };
  },

  binary() {
    return {
      value: 'application/octet-stream',
      strategy: ContentTypeStrategy.binary,
    };
  },

  stream() {
    return {
      value: 'application/octet-stream',
      strategy: ContentTypeStrategy.stream,
    };
  },

  graphql() {
    return {
      value: 'application/graphql',
      strategy: ContentTypeStrategy.graphql,
    };
  },

  protobuf() {
    return {
      value: 'application/x-protobuf',
      strategy: ContentTypeStrategy.protobuf,
    };
  },

  msgpack() {
    return {
      value: 'application/msgpack',
      strategy: ContentTypeStrategy.msgpack,
    };
  },

  custom(value, strategy) {
    return {
      value,
      strategy,
    };
  },
};

// ============================================================================
// REQUEST HELPERS
// ============================================================================

export const request: RequestHelper = {
  json(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'application/json',
    };
  },

  form(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'application/x-www-form-urlencoded',
    };
  },

  multipart(schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: 'multipart/form-data',
    };
  },

  contentType(contentTypeInput, schema, options = {}) {
    return {
      ...options,
      schema,
      contentType: contentTypeInput,
    };
  },
};

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export const response: ResponseHelper = {
  json(status, schema, options = {}) {
    return {
      ...options,
      status,
      schema,
      contentType: 'application/json',
    };
  },

  text(status, schema, options = {}) {
    return {
      ...options,
      status,
      schema,
      contentType: 'text/plain',
    };
  },

  binary(status, options = {}) {
    return {
      ...options,
      status,
      contentType: 'application/octet-stream',
    };
  },

  empty(status, options = {}) {
    return {
      ...options,
      status,
    };
  },

  contentType(status, contentTypeInput, schema, options = {}) {
    return {
      ...options,
      status,
      schema,
      contentType: contentTypeInput,
    };
  },
};

// ============================================================================
// GROUPED EXPORT
// ============================================================================

export const transport = {
  contentType,
  request,
  response,
};
