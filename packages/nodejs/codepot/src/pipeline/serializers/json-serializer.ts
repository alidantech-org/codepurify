import type { CodepotDefinition } from '@/contract/types/ir/definition';

export function serializeCodepotJson(definition: CodepotDefinition): string {
  return JSON.stringify(definition, null, 2);
}
