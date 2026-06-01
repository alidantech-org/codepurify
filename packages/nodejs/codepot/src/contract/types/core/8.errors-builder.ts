// src/contract/types/core/8.errors-builder.ts

import type { DefinitionItem } from '@/contract/types/compiled/definition';

import type { ContentDefinition, ErrorsDefinition } from '@/contract/types/compiled/response/errors/definition';

import type { DtoAuthoringRef, ErrorAuthoringRef, MaybeUsage } from './3.authoring-ref';

// ============================================================================
// SHARED ERROR INPUTS
// ============================================================================

export type ErrorSchemaInput = MaybeUsage<DtoAuthoringRef>;

// ============================================================================
// CONTENT METADATA
// ============================================================================

export type ContentInput = ContentDefinition;

export type ContentInputList = ContentInput | readonly ContentInput[];

// ============================================================================
// ERRORS
// ============================================================================

export interface ErrorInput extends DefinitionItem {
  readonly status: number;
  readonly schema: ErrorSchemaInput;
  readonly content?: readonly ContentInput[];
  readonly headers?: Record<string, ErrorSchemaInput>;
  readonly intent?: string;
}

export type ErrorInputMap = Record<string, ErrorInput>;

export interface ErrorsResult<TInput extends ErrorInputMap> {
  readonly errors: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: ErrorAuthoringRef;
  };
}

// ============================================================================
// CONTENT HELPER
// ============================================================================

export interface ContentHelper {
  json(options?: DefinitionItem): ContentInput;

  xml(options?: DefinitionItem): ContentInput;

  yaml(options?: DefinitionItem): ContentInput;

  html(options?: DefinitionItem): ContentInput;

  csv(options?: DefinitionItem): ContentInput;

  text(options?: DefinitionItem): ContentInput;

  binary(options?: DefinitionItem): ContentInput;

  stream(options?: DefinitionItem): ContentInput;

  multipart(options?: DefinitionItem): ContentInput;

  form(options?: DefinitionItem): ContentInput;

  graphql(options?: DefinitionItem): ContentInput;

  protobuf(options?: DefinitionItem): ContentInput;

  msgpack(options?: DefinitionItem): ContentInput;

  type(type: string, options?: DefinitionItem): ContentInput;

  types(...types: ContentInput[]): readonly ContentInput[];
}

// ============================================================================
// ERRORS BUILDER
// ============================================================================

export interface ErrorsBuilder {
  readonly state: Partial<ErrorsDefinition>;

  readonly content: ContentHelper;

  error(status: number, schema: ErrorSchemaInput, contentOrOptions?: ContentInputList | Omit<ErrorInput, 'status' | 'schema'>): ErrorInput;

  define<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput>;

  snapshot(): Partial<ErrorsDefinition>;
}
