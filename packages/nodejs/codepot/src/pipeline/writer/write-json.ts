// src/pipeline/writer/write-json.ts

import type { CodepotDefinition } from '@/contract/types/definition';

export function writeCodepotJson(definition: CodepotDefinition): string {
  return `${JSON.stringify(definition, null, 2)}\n`;
}
