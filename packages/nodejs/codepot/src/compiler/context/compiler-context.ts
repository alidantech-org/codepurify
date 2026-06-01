// src/compiler/context/compiler-context.ts

import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';
import type { UrlDefinition } from '@/contract/types/ir/url/definition';
import type { InfoDefinition } from '@/contract/types/ir/info/definition';

export interface CompilerDiagnostic {
  readonly level: 'error' | 'warning';
  readonly path: string;
  readonly message: string;
}

export interface CompilerContext {
  readonly authoring: VersionAuthoringState;
  readonly diagnostics: CompilerDiagnostic[];
  readonly ir: CodepotDefinition;
}

export function createCompilerContext(authoring: VersionAuthoringState): CompilerContext {
  return {
    authoring,
    diagnostics: [],
    ir: {
      codepot: authoring.codepot,
      key: authoring.key,
      version: authoring.version,
      info: authoring.info,
      urls: (authoring.urls ?? []) as unknown as UrlDefinition[],
      content_types: {},
      properties: {
        primitives: {},
        enums: {},
        composites: {},
      },
      schemas: {
        entities: {},
        field_sets: {},
        models: {},
        dtos: {},
        params: {},
      },
      responses: {
        errors: {},
      },
      security: {
        credentials: {},
        principals: {},
        policies: {},
      },
      resources: {},
    },
  };
}
