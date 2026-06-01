import type { CodepotConfig } from '@/contract/types/authoring/1.codepot-config.types';
import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';

import {
  emitAuthoringDebugPackage,
  serializeAuthoringDebugPackageJson,
  serializeAuthoringDebugPackageYaml,
  writeAuthoringDebugPackage,
  type AuthoringDebugPackage,
  type WriteAuthoringDebugPackageOptions,
  type WriteAuthoringDebugPackageResult,
} from './debug';

import { compile } from './compile';

export class CodepotCompiler {
  compile(contract: VersionAuthoringState): CodepotDefinition {
    return compile(contract);
  }

  emitAuthoringDebugPackage(config: CodepotConfig): AuthoringDebugPackage {
    return emitAuthoringDebugPackage(config);
  }

  serializeAuthoringDebugPackageJson(config: CodepotConfig): string {
    return serializeAuthoringDebugPackageJson(config);
  }

  serializeAuthoringDebugPackageYaml(config: CodepotConfig): string {
    return serializeAuthoringDebugPackageYaml(config);
  }

  writeAuthoringDebugPackage(
    config: CodepotConfig,
    options?: WriteAuthoringDebugPackageOptions,
  ): Promise<WriteAuthoringDebugPackageResult> {
    return writeAuthoringDebugPackage(config, options);
  }
}

export function createCodepotCompiler(): CodepotCompiler {
  return new CodepotCompiler();
}
