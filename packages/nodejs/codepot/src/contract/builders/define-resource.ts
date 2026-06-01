// src/contract/builders/define-resource.ts

import type { ErrorsDefinition } from '@/contract/types/errors/definition';
import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { DefineResourceOptions, ResourceAuthoringState, ResourceBuilder } from '@/contract/types/core/6.resource-builder';

import type { ErrorInputMap, ErrorsResult } from '@/contract/types/core/8.errors-builder';

import { resourceRef } from '@/contract/helpers/refs/authoring-ref-builder';

import { defineErrors } from './define-errors';
import { defineProperties } from './define-properties';
import { defineRoutes } from './define-routes';
import { defineSchemas } from './define-schemas';

// ============================================================================
// MERGE HELPERS
// ============================================================================

type MutableErrorsState = {
  errors?: ErrorsDefinition['errors'];
};

function mergeErrors(target: Partial<ErrorsDefinition>, source: Partial<ErrorsDefinition>): void {
  const mutable = target as MutableErrorsState;

  mutable.errors ??= {};
  Object.assign(mutable.errors, source.errors ?? {});
}

// ============================================================================
// DEFINE RESOURCE
// ============================================================================

export function defineResource(options: DefineResourceOptions): ResourceBuilder {
  const properties: Partial<PropertiesDefinition> = {};
  const schemas: Partial<SchemasDefinition> = {};
  const errors: Partial<ErrorsDefinition> = {};
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
      errors,
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

    defineProperties() {
      return defineProperties({
        scope: 'resource',
        resourceKey: options.key,
        state: properties,
      });
    },

    defineSchemas() {
      return defineSchemas({
        scope: 'resource',
        resourceKey: options.key,
        state: schemas,
      });
    },

    defineErrors<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput> {
      return defineErrors({
        state: errors,
      }).define(input);
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

    addErrors(nextErrors) {
      mergeErrors(errors, nextErrors);
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
