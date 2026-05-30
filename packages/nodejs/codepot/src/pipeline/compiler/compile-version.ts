// src/pipeline/compiler/compile-version.ts

import type { CodepotDefinition } from '@/contract/types/definition';
import type { VersionBuilder } from '@/contract/types/core/2.version-builder';

export function compileVersionContract(version: VersionBuilder): CodepotDefinition {
  const state = version.snapshot();

  return {
    codepot: state.codepot,
    key: state.key,
    version: state.version,
    info: state.info,
    urls: [...state.urls],

    properties: {
      primitives: state.properties.primitives ?? {},
      enums: state.properties.enums ?? {},
      composites: state.properties.composites ?? {},
    },

    schemas: {
      entities: state.schemas.entities ?? {},
      models: state.schemas.models ?? {},
      dtos: state.schemas.dtos ?? {},
      params: state.schemas.params ?? {},
    },

    transport: {
      contentTypes: state.transport.contentTypes ?? {},
      requests: state.transport.requests ?? {},
      responses: state.transport.responses ?? {},
      defaults: state.transport.defaults,
    },

    security: {
      schemes: state.security.schemes ?? {},
      auth: state.security.auth ?? {},
      roleSources: state.security.roleSources,
      roleSets: state.security.roleSets,
      contexts: state.security.contexts,
      guards: state.security.guards,
      defaults: state.security.defaults,
    },

    resources: state.resources,

    description: state.description,
    deprecated: state.deprecated,
    meta: state.meta,
  };
}
