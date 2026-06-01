// src/contract/types/core/8.errors-builder.ts

import type { DtoAuthoringRef, ErrorAuthoringRef, MaybeUsage } from './3.authoring-ref';

import type { DefinitionItem } from './4.properties-builder';

// ============================================================================
// AUTHORING CONTENT TYPES
// ============================================================================

export interface ContentDefinition extends DefinitionItem {
  readonly type: string;
}

export type ContentInput = ContentDefinition | readonly ContentDefinition[];

// ============================================================================
// SHARED ERROR INPUTS
// ============================================================================

export type ErrorSchemaInput = MaybeUsage<DtoAuthoringRef>;

// ============================================================================
// ERRORS
// ============================================================================

export interface ErrorInput extends DefinitionItem {
  readonly status: number;
  readonly schema: ErrorSchemaInput;
  readonly content?: readonly ContentDefinition[];
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
// ERRORS AUTHORING STATE (mutable, not compiled IR)
// ============================================================================

export type ErrorsAuthoringState = Record<string, ErrorInput>;

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

  type(type: string, options?: DefinitionItem): ContentDefinition;

  types(...types: ContentDefinition[]): readonly ContentDefinition[];
}

// ============================================================================
// ERRORS BUILDER
// ============================================================================

export interface ErrorsBuilder {
  readonly state: Partial<ErrorsAuthoringState>;

  readonly content: ContentHelper;

  error(status: number, schema: ErrorSchemaInput, contentOrOptions?: ContentInput | Omit<ErrorInput, 'status' | 'schema'>): ErrorInput;

  define<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput>;

  snapshot(): Partial<ErrorsAuthoringState>;
}
