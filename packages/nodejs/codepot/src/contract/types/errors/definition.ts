import type { DefinitionItem } from '@/contract/types/definition';

import type { DtoAuthoringRef, MaybeUsage } from '@/contract/types/core/3.authoring-ref';

// ============================================================================
// CONTENT
// ============================================================================

export interface ContentDefinition extends DefinitionItem {
  /**
   * MIME type value.
   *
   * Examples:
   * - application/json
   * - application/xml
   * - multipart/form-data
   * - text/csv
   */
  readonly type: string;
}

// ============================================================================
// ERRORS
// ============================================================================

export type ErrorSchemaInput = MaybeUsage<DtoAuthoringRef>;

export interface ErrorDefinition extends DefinitionItem {
  /**
   * HTTP status code used when this error is emitted for HTTP targets.
   *
   * Non-HTTP targets may map this to their own error strategy.
   */
  readonly status: number;

  /**
   * DTO boundary schema for the error payload.
   */
  readonly schema: ErrorSchemaInput;

  /**
   * Optional response content metadata.
   * Defaults to JSON if omitted.
   */
  readonly content?: readonly ContentDefinition[];

  /**
   * Optional error response headers.
   */
  readonly headers?: Record<string, ErrorSchemaInput>;

  /**
   * Generator-facing semantic intent.
   *
   * Examples:
   * - validation
   * - unauthorized
   * - forbidden
   * - not_found
   * - conflict
   */
  readonly intent?: string;
}

// ============================================================================
// ROOT
// ============================================================================

export interface ErrorsDefinition {
  readonly errors: Record<string, ErrorDefinition>;
}
