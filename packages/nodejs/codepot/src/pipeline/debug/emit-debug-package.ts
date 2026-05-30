import type { CodepotConfig } from '@/contract/types/core/1.codepot-config.types';
import { toDebugAuthoringJson } from '@/contract/debug/to-debug-authoring-json';

export interface DebugPackageOutput {
  readonly contracts: readonly unknown[];
}

export function emitDebugPackage(config: CodepotConfig): DebugPackageOutput {
  return {
    contracts: config.contracts.map((contract) =>
      toDebugAuthoringJson(contract.snapshot()),
    ),
  };
}
