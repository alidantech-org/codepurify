// src/pipeline/compiler/compile-package.ts

import type { CodepotConfig } from '@/contract/types/core/1.codepot-config.types';
import type { CodepotDefinition } from '@/contract/types/definition';

import { compileVersionContract } from './compile-version';

export interface CompiledPackage {
  readonly contracts: readonly CodepotDefinition[];
}

export function compilePackage(config: CodepotConfig): CompiledPackage {
  return {
    contracts: config.contracts.map((contract) => compileVersionContract(contract)),
  };
}
