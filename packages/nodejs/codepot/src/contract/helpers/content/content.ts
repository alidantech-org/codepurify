// src/contract/helpers/content/content.ts

import type { ContentDefinition, ContentTypeKey } from '@/contract/types/authoring/content.types';

// ============================================================================
// INTERNAL
// ============================================================================

function defineContent(
  key: ContentTypeKey | string,
  type: string,
  strategy: ContentTypeKey | string = key,
  options: Omit<ContentDefinition, 'key' | 'type' | 'strategy'> = {},
): ContentDefinition {
  return {
    ...options,
    key,
    type,
    strategy,
  };
}

// ============================================================================
// CONTENT HELPER
// ============================================================================

export const content = {
  json(options = {}) {
    return defineContent('json', 'application/json', 'json', options);
  },

  xml(options = {}) {
    return defineContent('xml', 'application/xml', 'xml', options);
  },

  yaml(options = {}) {
    return defineContent('yaml', 'application/yaml', 'yaml', options);
  },

  html(options = {}) {
    return defineContent('html', 'text/html', 'html', options);
  },

  csv(options = {}) {
    return defineContent('csv', 'text/csv', 'csv', options);
  },

  text(options = {}) {
    return defineContent('text', 'text/plain', 'text', options);
  },

  binary(options = {}) {
    return defineContent('binary', 'application/octet-stream', 'binary', options);
  },

  stream(options = {}) {
    return defineContent('stream', 'application/octet-stream', 'stream', options);
  },

  multipart(options = {}) {
    return defineContent('multipart', 'multipart/form-data', 'multipart', options);
  },

  form(options = {}) {
    return defineContent('form', 'application/x-www-form-urlencoded', 'form', options);
  },

  graphql(options = {}) {
    return defineContent('graphql', 'application/graphql', 'graphql', options);
  },

  protobuf(options = {}) {
    return defineContent('protobuf', 'application/x-protobuf', 'protobuf', options);
  },

  msgpack(options = {}) {
    return defineContent('msgpack', 'application/msgpack', 'msgpack', options);
  },

  custom(key: string, type: string, strategy = 'custom', options = {}) {
    return defineContent(key, type, strategy, options);
  },

  types(...types: ContentDefinition[]) {
    return types;
  },
};
