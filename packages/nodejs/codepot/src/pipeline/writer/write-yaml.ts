// src/pipeline/writer/write-yaml.ts

import type { CodepotDefinition } from '@/contract/types/definition';
import { stringify } from 'yaml';

export function writeCodepotYaml(definition: CodepotDefinition): string {
  return stringify(definition);
}
