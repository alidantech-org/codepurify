// src/contract/builders/define-version-contract.ts

import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { ResourceDefinition } from '@/contract/types/resource/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';
import type { SecurityDefinition } from '@/contract/types/security/definition';
import type { TransportDefinition } from '@/contract/types/transport/definition';

import type { DefineVersionContractOptions, VersionAuthoringState, VersionBuilder } from '@/contract/types/core/2.version-builder';

import type { DefineResourceOptions, ResourceBuilder } from '@/contract/types/core/6.resource-builder';

import { defineProperties } from './define-properties';
import { defineDtoSchemas } from './define-dto-schemas';
import { defineResource } from './define-resource';
import { defineTransport } from './define-transport';
import { defineSecurity } from './define-security';

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_CODEPOT_VERSION = '1.0';

// ============================================================================
// STATE FACTORIES
// ============================================================================

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
// MERGE HELPERS
// ============================================================================

function mergeProperties(target: Partial<PropertiesDefinition>, source: Partial<PropertiesDefinition>): void {
  Object.assign((target.primitives ??= {}), source.primitives ?? {});
  Object.assign((target.enums ??= {}), source.enums ?? {});
  Object.assign((target.composites ??= {}), source.composites ?? {});
}

function mergeSchemas(target: Partial<SchemasDefinition>, source: Partial<SchemasDefinition>): void {
  Object.assign((target.entities ??= {}), source.entities ?? {});
  Object.assign((target.models ??= {}), source.models ?? {});
  Object.assign((target.dtos ??= {}), source.dtos ?? {});
  Object.assign((target.params ??= {}), source.params ?? {});
}

function mergeTransport(target: Partial<TransportDefinition>, source: Partial<TransportDefinition>): void {
  Object.assign((target.contentTypes ??= {}), source.contentTypes ?? {});
  Object.assign((target.requests ??= {}), source.requests ?? {});
  Object.assign((target.responses ??= {}), source.responses ?? {});

  if (source.defaults !== undefined) {
    target.defaults = source.defaults;
  }
}

function mergeSecurity(target: Partial<SecurityDefinition>, source: Partial<SecurityDefinition>): void {
  Object.assign((target.schemes ??= {}), source.schemes ?? {});
  Object.assign((target.auth ??= {}), source.auth ?? {});
  Object.assign((target.roleSources ??= {}), source.roleSources ?? {});
  Object.assign((target.roleSets ??= {}), source.roleSets ?? {});
  Object.assign((target.contexts ??= {}), source.contexts ?? {});
  Object.assign((target.guards ??= {}), source.guards ?? {});

  if (source.defaults !== undefined) {
    target.defaults = source.defaults;
  }
}

function snapshotResources(
  resources: Record<string, ResourceDefinition>,
  resourceBuilders: Record<string, ResourceBuilder>,
): Record<string, ResourceDefinition> {
  return {
    ...resources,
    ...Object.fromEntries(
      Object.entries(resourceBuilders).map(([key, builder]) => [key, builder.snapshot() as unknown as ResourceDefinition]),
    ),
  };
}

// ============================================================================
// DEFINE VERSION CONTRACT
// ============================================================================

export function defineVersionContract(options: DefineVersionContractOptions): VersionBuilder {
  const properties = createPropertiesState(options.properties);
  const schemas = createSchemasState(options.schemas);
  const transport = createTransportState(options.transport);
  const security = createSecurityState(options.security);

  const resources: Record<string, ResourceDefinition> = {
    ...(options.resources ?? {}),
  };

  const resourceBuilders: Record<string, ResourceBuilder> = {};

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
      resources: snapshotResources(resources, resourceBuilders),

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

      resourceBuilders[resourceOptions.key] = resourceBuilder;

      return resourceBuilder;
    },

    addResource(key, resource) {
      resources[key] = resource;
      return builder;
    },

    addProperties(nextProperties) {
      mergeProperties(properties, nextProperties);
      return builder;
    },

    addSchemas(nextSchemas) {
      mergeSchemas(schemas, nextSchemas);
      return builder;
    },

    addTransport(nextTransport) {
      mergeTransport(transport, nextTransport);
      return builder;
    },

    addSecurity(nextSecurity) {
      mergeSecurity(security, nextSecurity);
      return builder;
    },

    snapshot,
  };

  return builder;
}
