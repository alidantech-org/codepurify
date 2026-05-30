// src/contract/builders/define-resource.ts

import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';
import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { DefineResourceOptions, ResourceAuthoringState, ResourceBuilder } from '@/contract/types/core/6.resource-builder';

import type { RouteSecurityRefsInput } from '@/contract/types/core/9.security-builder';

import { resourceRef } from '@/contract/helpers/refs/authoring-ref-builder';
import { securityRoute } from '@/contract/helpers/security/security';

import { defineProperties } from './define-properties';
import { defineDtoSchemas } from './define-dto-schemas';
import { defineRoutes } from './define-routes';

// ============================================================================
// DEFINE RESOURCE
// ============================================================================

export function defineResource(options: DefineResourceOptions): ResourceBuilder {
  const properties: Partial<PropertiesDefinition> = {};
  const schemas: Partial<SchemasDefinition> = {};
  const operations: Record<string, OperationDefinition> = {};
  const routes: RoutesDefinition = {};

  let defaultSecurity = options.security;

  function snapshot(): ResourceAuthoringState {
    return {
      key: options.key,
      folders: options.folders ?? [],
      defaults: {
        ...(options.defaults ?? {}),
        ...(defaultSecurity ? { security: defaultSecurity } : {}),
      },
      properties,
      schemas,
      operations,
      routes,
      description: options.description,
      deprecated: options.deprecated,
      meta: options.meta,
    };
  }

  const builder: ResourceBuilder = {
    get state() {
      return snapshot();
    },

    ref: resourceRef(options.key),

    security: securityRoute,

    defineProperties() {
      return defineProperties({
        scope: 'resource',
        resourceKey: options.key,
        state: properties,
        schemas,
      });
    },

    defineDtoSchemas() {
      return defineDtoSchemas({
        scope: 'resource',
        resourceKey: options.key,
        state: schemas,
      });
    },

    defineRoutes() {
      return defineRoutes({
        resourceKey: options.key,
        routes,
        operations,
      });
    },

    setSecurity(security) {
      defaultSecurity = security;
      return builder;
    },

    public() {
      defaultSecurity = securityRoute.public();
      return builder;
    },

    protected(input?: RouteSecurityRefsInput) {
      defaultSecurity = securityRoute.protected(input);
      return builder;
    },

    addRoute(key: string, route: RoutePathDefinition) {
      routes[key] = route;
      return builder;
    },

    addOperation(key: string, operation: OperationDefinition) {
      operations[key] = operation;
      return builder;
    },

    snapshot,
  };

  return builder;
}
