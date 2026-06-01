// src/contract/helpers/content/content.ts

import type { ContentDefinition } from '@/contract/types/compiled/response/errors/definition';

// ============================================================================
// INTERNAL
// ============================================================================

function contentType(type: string, options: Omit<ContentDefinition, 'type'> = {}): ContentDefinition {
  return {
    ...options,
    type,
  };
}

// ============================================================================
// CONTENT HELPER
// ============================================================================

export const content = {
  json(options = {}) {
    return contentType('application/json', options);
  },

  xml(options = {}) {
    return contentType('application/xml', options);
  },

  yaml(options = {}) {
    return contentType('application/yaml', options);
  },

  html(options = {}) {
    return contentType('text/html', options);
  },

  csv(options = {}) {
    return contentType('text/csv', options);
  },

  text(options = {}) {
    return contentType('text/plain', options);
  },

  binary(options = {}) {
    return contentType('application/octet-stream', options);
  },

  stream(options = {}) {
    return contentType('application/octet-stream', options);
  },

  multipart(options = {}) {
    return contentType('multipart/form-data', options);
  },

  form(options = {}) {
    return contentType('application/x-www-form-urlencoded', options);
  },

  graphql(options = {}) {
    return contentType('application/graphql', options);
  },

  protobuf(options = {}) {
    return contentType('application/x-protobuf', options);
  },

  msgpack(options = {}) {
    return contentType('application/msgpack', options);
  },

  type(type: string, options = {}) {
    return contentType(type, options);
  },

  types(...types: ContentDefinition[]) {
    return types;
  },
};
