import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';

import { createCompilerContext } from './context/compiler-context';
import { compileProperties } from './passes/01-properties';
import { compileMeta } from './passes/09-meta';
export { emitDebugPackage } from './debug';
export type { DebugPackageOutput } from './debug';

export { writeDebugPackageJson, writeDebugPackageYaml, writeDebugFiles } from './debug';

export type { WriteDebugFilesResult } from './debug';

export function compile(contract: VersionAuthoringState): CodepotDefinition {
  const ctx = createCompilerContext(contract);

  compileMeta(ctx);
  compileProperties(ctx);

  if (ctx.diagnostics.some((diagnostic) => diagnostic.level === 'error')) {
    throw new Error(ctx.diagnostics.map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`).join('\n'));
  }

  return ctx.ir as unknown as CodepotDefinition;
}
