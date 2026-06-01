// src/contract/types/compiled/response/errors/definition.ts

import type { DefinitionItem } from '../../definition';
import type { Ref } from '../../ref';
import type { ContentTypeDefinition } from '../../content/definition';
import type { DtoDefinition } from '../../schema/dto/definition';

// ============================================================================
// ERROR RESPONSE
// ============================================================================

export interface ErrorResponseDefinition extends DefinitionItem {
  readonly status: number;
  readonly intent?: string;
  readonly schema: Ref<DtoDefinition>;
  readonly content_type: Ref<ContentTypeDefinition>;
  readonly headers?: Record<string, Ref<DtoDefinition>>;
}
