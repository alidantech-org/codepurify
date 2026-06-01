import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';

import { createCompilerContext } from './context/compiler-context';
import { compileProperties } from './passes/01-properties';
import { compileMeta } from './passes/09-meta';

function throwIfDiagnosticsHaveErrors(
  diagnostics: readonly {
    readonly level: 'error' | 'warning';
    readonly path: string;
    readonly message: string;
  }[],
): void {
  const errors = diagnostics.filter((diagnostic) => diagnostic.level === 'error');

  if (errors.length === 0) return;

  throw new Error(
    errors
      .map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`)
      .join('\n'),
  );
}

export function compile(contract: VersionAuthoringState): CodepotDefinition {
  const ctx = createCompilerContext(contract);

  compileMeta(ctx);
  compileProperties(ctx);

  throwIfDiagnosticsHaveErrors(ctx.diagnostics);

  return ctx.ir;
}
