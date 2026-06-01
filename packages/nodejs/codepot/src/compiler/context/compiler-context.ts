// src/compiler/context/compiler-context.ts

import type { VersionAuthoringState } from '@/contract/types/authoring/2.version-builder';
import type { CodepotDefinition } from '@/contract/types/ir/definition';
import type { ContentTypeDefinition } from '@/contract/types/ir/content/definition';
import type { UrlDefinition } from '@/contract/types/ir/url/definition';
import type { InfoDefinition } from '@/contract/types/ir/info/definition';
import type { PropertiesDefinition } from '@/contract/types/ir/properties/definition';
import type { SchemasDefinition } from '@/contract/types/ir/schema/definition';
import type { ResponsesDefinition } from '@/contract/types/ir/response/definition';
import type { SecurityDefinition } from '@/contract/types/ir/security/definition';
import type { ResourceDefinition } from '@/contract/types/ir/resource/definition';

export interface CompilerDiagnostic {
  readonly level: 'error' | 'warning';
  readonly path: string;
  readonly message: string;
}

/**
 * Mutable version of CodepotDefinition for use during compilation.
 * All fields are writable to allow passes to build the IR incrementally.
 */
type MutableCodepotDefinition = {
  codepot: string;
  key: string;
  version: number;
  info: InfoDefinition;
  urls: UrlDefinition[];
  content_types: Record<string, ContentTypeDefinition>;
  properties: PropertiesDefinition;
  schemas: SchemasDefinition;
  responses: ResponsesDefinition;
  security: SecurityDefinition;
  resources: Record<string, ResourceDefinition>;
};

export interface CompilerContext {
  readonly authoring: VersionAuthoringState;
  readonly diagnostics: CompilerDiagnostic[];
  readonly ir: MutableCodepotDefinition;
}

export function createCompilerContext(authoring: VersionAuthoringState): CompilerContext {
  return {
    authoring,
    diagnostics: [],
    ir: {
      codepot: authoring.codepot,
      key: authoring.key,
      version: authoring.version,
      info: authoring.info as InfoDefinition,
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
