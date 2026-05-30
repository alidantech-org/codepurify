// src/contract/builders/define-version-contract.ts

import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { ResourceDefinition } from '@/contract/types/resource/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';
import type { SecurityDefinition } from '@/contract/types/security/definition';
import type { TransportDefinition } from '@/contract/types/transport/definition';

import type { DefineVersionContractOptions, VersionAuthoringState, VersionBuilder } from '@/contract/types/core/2.version-builder';

import type { DefineResourceOptions } from '@/contract/types/core/6.resource-builder';

import { defineProperties } from './define-properties';
import { defineDtoSchemas } from './define-dto-schemas';
import { defineResource } from './define-resource';
import { defineTransport } from './define-transport';
import { defineSecurity } from './define-security';

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_CODEPOT_VERSION = '1.0';

function createPropertiesState(initial?: Partial<PropertiesDefinition>): Partial<PropertiesDefinition> {
  return {
    primitives: initial?.primitives ?? {},
    enums: initial?.enums ?? {},
    composites: initial?.composites ?? {},
  };
}

function createSchemasState(initial?: Partial<SchemasDefinition>): Partial<SchemasDefinition> {
  return {
    entities: initial?.entities ?? {},
    models: initial?.models ?? {},
    dtos: initial?.dtos ?? {},
    params: initial?.params ?? {},
  };
}

function createTransportState(initial?: Partial<TransportDefinition>): Partial<TransportDefinition> {
  return {
    contentTypes: initial?.contentTypes ?? {},
    requests: initial?.requests ?? {},
    responses: initial?.responses ?? {},
    defaults: initial?.defaults,
  };
}

function createSecurityState(initial?: Partial<SecurityDefinition>): Partial<SecurityDefinition> {
  return {
    schemes: initial?.schemes ?? {},
    auth: initial?.auth ?? {},
    roleSources: initial?.roleSources ?? {},
    roleSets: initial?.roleSets ?? {},
    contexts: initial?.contexts ?? {},
    guards: initial?.guards ?? {},
    defaults: initial?.defaults,
  };
}

// ============================================================================
// DEFINE VERSION CONTRACT
// ============================================================================

export function defineVersionContract(options: DefineVersionContractOptions): VersionBuilder {
  const properties = createPropertiesState(options.properties);
  const schemas = createSchemasState(options.schemas);
  let transport = createTransportState(options.transport);
  let security = createSecurityState(options.security);

  const resources: Record<string, ResourceDefinition> = {
    ...(options.resources ?? {}),
  };

  function snapshot(): VersionAuthoringState {
    return {
      codepot: options.codepot ?? DEFAULT_CODEPOT_VERSION,
      key: options.key,
      version: options.version,
      info: options.info,
      urls: options.urls ?? [],

      properties,
      schemas,
      transport,
      security,
      resources,

      description: options.description,
      deprecated: options.deprecated,
      meta: options.meta,
    };
  }

  const builder: VersionBuilder = {
    get state() {
      return snapshot();
    },

    defineProperties() {
      return defineProperties({
        scope: 'version',
        state: properties,
        schemas,
      });
    },

    defineDtoSchemas() {
      return defineDtoSchemas({
        scope: 'version',
        state: schemas,
      });
    },

    defineTransport() {
      return defineTransport({
        state: transport,
      });
    },

    defineSecurity() {
      return defineSecurity({
        state: security,
      });
    },

    defineResource(resourceOptions: DefineResourceOptions) {
      const resourceBuilder = defineResource(resourceOptions);

      resources[resourceOptions.key] = resourceBuilder.snapshot() as unknown as ResourceDefinition;

      return resourceBuilder;
    },

    addResource(key, resource) {
      resources[key] = resource;
      return builder;
    },

    addProperties(nextProperties) {
      Object.assign(properties.primitives ?? {}, nextProperties.primitives ?? {});
      Object.assign(properties.enums ?? {}, nextProperties.enums ?? {});
      Object.assign(properties.composites ?? {}, nextProperties.composites ?? {});
      return builder;
    },

    addSchemas(nextSchemas) {
      Object.assign(schemas.entities ?? {}, nextSchemas.entities ?? {});
      Object.assign(schemas.models ?? {}, nextSchemas.models ?? {});
      Object.assign(schemas.dtos ?? {}, nextSchemas.dtos ?? {});
      Object.assign(schemas.params ?? {}, nextSchemas.params ?? {});
      return builder;
    },

    addTransport(nextTransport) {
      transport = {
        contentTypes: {
          ...(transport.contentTypes ?? {}),
          ...(nextTransport.contentTypes ?? {}),
        },
        requests: {
          ...(transport.requests ?? {}),
          ...(nextTransport.requests ?? {}),
        },
        responses: {
          ...(transport.responses ?? {}),
          ...(nextTransport.responses ?? {}),
        },
        defaults: nextTransport.defaults ?? transport.defaults,
      };

      return builder;
    },

    addSecurity(nextSecurity) {
      security = {
        schemes: {
          ...(security.schemes ?? {}),
          ...(nextSecurity.schemes ?? {}),
        },
        auth: {
          ...(security.auth ?? {}),
          ...(nextSecurity.auth ?? {}),
        },
        roleSources: {
          ...(security.roleSources ?? {}),
          ...(nextSecurity.roleSources ?? {}),
        },
        roleSets: {
          ...(security.roleSets ?? {}),
          ...(nextSecurity.roleSets ?? {}),
        },
        contexts: {
          ...(security.contexts ?? {}),
          ...(nextSecurity.contexts ?? {}),
        },
        guards: {
          ...(security.guards ?? {}),
          ...(nextSecurity.guards ?? {}),
        },
        defaults: nextSecurity.defaults ?? security.defaults,
      };

      return builder;
    },

    snapshot,
  };

  return builder;
}
