// src/contract/types/compiled/content/definition.ts

import type { DefinitionItem } from '../definition';

export interface ContentTypeDefinition extends DefinitionItem {
  readonly type: string;
}

export type ContentTypesDefinition = Record<string, ContentTypeDefinition>;
