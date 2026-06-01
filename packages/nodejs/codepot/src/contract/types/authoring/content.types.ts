// src/contract/types/core/content.types.ts

import type { DefinitionItem } from './4.properties-builder';

// ============================================================================
// CONTENT TYPE KEYS
// ============================================================================

export const ContentTypeKey = {
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  html: 'html',
  csv: 'csv',
  text: 'text',
  binary: 'binary',
  stream: 'stream',
  multipart: 'multipart',
  form: 'form',
  graphql: 'graphql',
  protobuf: 'protobuf',
  msgpack: 'msgpack',
  custom: 'custom',
} as const;

export type ContentTypeKey = (typeof ContentTypeKey)[keyof typeof ContentTypeKey];

// ============================================================================
// CONTENT DEFINITION
// ============================================================================

export interface ContentDefinition extends DefinitionItem {
  /**
   * Stable authoring key.
   * Compiler later converts this to: #/content_types/{key}
   */
  readonly key: ContentTypeKey | string;

  /**
   * MIME type.
   */
  readonly type: string;

  /**
   * Optional strategy hint for codegen.
   */
  readonly strategy?: ContentTypeKey | string;
}

export type ContentInput = ContentDefinition | readonly ContentDefinition[];

// ============================================================================
// CONTENT HELPER
// ============================================================================

export interface ContentHelper {
  json(options?: DefinitionItem): ContentDefinition;

  xml(options?: DefinitionItem): ContentDefinition;

  yaml(options?: DefinitionItem): ContentDefinition;

  html(options?: DefinitionItem): ContentDefinition;

  csv(options?: DefinitionItem): ContentDefinition;

  text(options?: DefinitionItem): ContentDefinition;

  binary(options?: DefinitionItem): ContentDefinition;

  stream(options?: DefinitionItem): ContentDefinition;

  multipart(options?: DefinitionItem): ContentDefinition;

  form(options?: DefinitionItem): ContentDefinition;

  graphql(options?: DefinitionItem): ContentDefinition;

  protobuf(options?: DefinitionItem): ContentDefinition;

  msgpack(options?: DefinitionItem): ContentDefinition;

  custom(key: string, type: string, strategy?: string): ContentDefinition;

  types(...types: ContentDefinition[]): readonly ContentDefinition[];
}
