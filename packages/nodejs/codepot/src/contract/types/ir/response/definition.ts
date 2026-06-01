// src/contract/types/compiled/response/definition.ts

import type { ErrorResponseDefinition } from './errors/definition';

// ============================================================================
// RESPONSES
// ============================================================================

export interface ResponsesDefinition {
  readonly errors: Record<string, ErrorResponseDefinition>;
}
