import type { OpenApiComponents } from '../openapi/openapi.types.js';
import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext } from './compiler-context.js';
import type { PropertyRefGroup } from '../properties/property.types.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';
import type { CompileQueryModelContext } from './schemas/compile-query-model-schema.js';
import { buildSchemaResolver } from './schemas/build-schema-resolver.js';
import { compileComponentSchema } from './schemas/compile-component-schema.js';
import { compileModelSchema } from './schemas/compile-model-schema.js';
import { compileNamedPropertySchema } from './schemas/compile-named-property-schema.js';
import { compilePropertyGroupSchema } from './schemas/compile-property-group-schema.js';
import { compileParameterComponent } from './components/compile-parameter-component.js';
import { compileRequestBodyComponent } from './components/compile-request-body-component.js';
import { compileResponseComponent } from './components/compile-response-component.js';
import { resolvePendingRefs } from './refs/resolve-pending-refs.js';
import { toSchemaName } from '../naming/schema-name.js';
import { QueryModelOptions } from '../config/query-model-defaults.js';

export interface CompiledComponentsResult {
  readonly components: OpenApiComponents;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
}

export function compileComponents(contract: VersionContract, context: CompilerContext): CompiledComponentsResult {
  const resolver = buildSchemaResolver(
    contract.resources,
    contract.properties,
    contract.schemaComponents,
    contract.parameterComponents,
    contract.requestBodyComponents,
    contract.responseComponents,
    context,
  );

  const schemas: Record<string, unknown> = {};
  const parameters: Record<string, unknown> = {};
  const requestBodies: Record<string, unknown> = {};
  const responses: Record<string, unknown> = {};

  for (const registry of contract.schemaComponents) {
    for (const definition of registry.definitions) {
      const ref = registry.ref[definition.name];
      schemas[resolver.schemas.get(ref.id) ?? definition.name] = resolvePendingRefs(
        compileComponentSchema(definition, ref),
        resolver,
        context,
      );
    }
  }

  for (const registry of contract.parameterComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.parameters.get(registry.ref[definition.key].id);
      if (name) parameters[name] = compileParameterComponent(definition, resolver);
    }
  }

  for (const registry of contract.requestBodyComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.requestBodies.get(registry.ref[definition.name].id);
      if (name) requestBodies[name] = compileRequestBodyComponent(definition, resolver);
    }
  }

  for (const registry of contract.responseComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.responses.get(registry.ref[definition.name].id);
      if (name) responses[name] = compileResponseComponent(definition, resolver);
    }
  }

  for (const resource of contract.resources) {
    for (const registry of resource.properties) {
      for (const definition of registry.definitions) {
        if (definition.emitSchema) {
          const groupRefs = registry.ref[definition.name];

          if (isPropertyRefGroup(groupRefs)) {
            const schemaName = toSchemaName(definition.name);

            schemas[schemaName] = resolvePendingRefs(compilePropertyGroupSchema(definition, groupRefs, resolver), resolver, context);
          }
        }
      }

      for (const value of Object.values(registry.ref)) {
        if (isPropertyRefGroup(value)) {
          for (const [key, fieldRef] of Object.entries(value)) {
            if (fieldRef.targetRefId) continue;

            const name = resolver.schemas.get(fieldRef.id);
            const definition = registry.definitions.find((item) => key in (item.fields as Record<string, unknown>));
            const sourceField = (definition?.fields as Record<string, unknown>)[key] as SchemaFieldMap[string] | undefined;

            if (!name || !sourceField) continue;

            schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver, context);
          }

          continue;
        }

        if (!isEntityRefs(value)) continue;

        // Emit individual property schemas for entity fields
        for (const [key, fieldRef] of Object.entries(value.fields)) {
          if (fieldRef.targetRefId) continue;

          const name = resolver.schemas.get(fieldRef.id);
          const sourceField = value.model.sourceFields?.[key];

          if (!name || !sourceField) continue;

          schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver, context);
        }

        // Check if this is V2 with full model emission support
        const isV2 = 'modelEmission' in value && 'privateModel' in value;

        if (isV2) {
          const v2Value = value as unknown as {
            model: Parameters<typeof compileModelSchema>[0];
            publicModel: Parameters<typeof compileModelSchema>[0];
            privateModel: Parameters<typeof compileModelSchema>[0];
            internalModel: Parameters<typeof compileModelSchema>[0];
            systemModel: Parameters<typeof compileModelSchema>[0];
            partialModel: Parameters<typeof compileModelSchema>[0];
            publicPartialModel: Parameters<typeof compileModelSchema>[0];
            privatePartialModel: Parameters<typeof compileModelSchema>[0];
            internalPartialModel: Parameters<typeof compileModelSchema>[0];
            systemPartialModel: Parameters<typeof compileModelSchema>[0];
            query: {
              exact: Parameters<typeof compileModelSchema>[0];
              search: Parameters<typeof compileModelSchema>[0];
              exactSearch: Parameters<typeof compileModelSchema>[0];
              range: Parameters<typeof compileModelSchema>[0];
              in: Parameters<typeof compileModelSchema>[0];
              exists: Parameters<typeof compileModelSchema>[0];
              sort: Parameters<typeof compileModelSchema>[0];
              select: Parameters<typeof compileModelSchema>[0];
            };
            modelEmission: {
              model: boolean;
              publicModel: boolean;
              privateModel: boolean;
              internalModel: boolean;
              systemModel: boolean;
              partialModel: boolean;
              publicPartialModel: boolean;
              privatePartialModel: boolean;
              internalPartialModel: boolean;
              systemPartialModel: boolean;
              query: {
                exact: boolean;
                search: boolean;
                exactSearch: boolean;
                range: boolean;
                in: boolean;
                exists: boolean;
                sort: boolean;
                select: boolean;
              };
            };
            queryModelOptions: QueryModelOptions;
          };

          const emission = v2Value.modelEmission;
          const queryModelContext: CompileQueryModelContext = {
            queryModelOptions: v2Value.queryModelOptions,
          };

          const modelsToEmit: Array<{ ref: Parameters<typeof compileModelSchema>[0]; enabled: boolean }> = [
            { ref: v2Value.model, enabled: emission.model },
            { ref: v2Value.publicModel, enabled: emission.publicModel },
            { ref: v2Value.privateModel, enabled: emission.privateModel },
            { ref: v2Value.internalModel, enabled: emission.internalModel },
            { ref: v2Value.systemModel, enabled: emission.systemModel },
            { ref: v2Value.partialModel, enabled: emission.partialModel },
            { ref: v2Value.publicPartialModel, enabled: emission.publicPartialModel },
            { ref: v2Value.privatePartialModel, enabled: emission.privatePartialModel },
            { ref: v2Value.internalPartialModel, enabled: emission.internalPartialModel },
            { ref: v2Value.systemPartialModel, enabled: emission.systemPartialModel },
            { ref: v2Value.query.exact, enabled: emission.query.exact },
            { ref: v2Value.query.search, enabled: emission.query.search },
            { ref: v2Value.query.exactSearch, enabled: emission.query.exactSearch },
            { ref: v2Value.query.range, enabled: emission.query.range },
            { ref: v2Value.query.in, enabled: emission.query.in },
            { ref: v2Value.query.exists, enabled: emission.query.exists },
            { ref: v2Value.query.sort, enabled: emission.query.sort },
            { ref: v2Value.query.select, enabled: emission.query.select },
          ];

          for (const { ref, enabled } of modelsToEmit) {
            if (!enabled) continue;

            const name = resolver.schemas.get(ref.id);
            if (!name) continue;

            schemas[name] = resolvePendingRefs(compileModelSchema(ref, queryModelContext), resolver, context);
          }
        } else {
          // Legacy behavior for V1 refs
          const modelsToEmit = [
            value.model,
            value.publicModel,
            value.partialModel,
            value.query.exact,
            value.query.search,
            value.query.exactSearch,
            value.query.range,
            value.query.in,
            value.query.exists,
            value.query.sort,
            value.query.select,
          ];

          for (const modelRef of modelsToEmit) {
            const name = resolver.schemas.get(modelRef.id);
            if (!name) continue;

            schemas[name] = resolvePendingRefs(compileModelSchema(modelRef), resolver, context);
          }
        }
      }
    }

    for (const registry of resource.schemaComponents) {
      for (const definition of registry.definitions) {
        const ref = registry.ref[definition.name];
        const name = resolver.schemas.get(ref.id);

        if (!name) continue;

        schemas[name] = resolvePendingRefs(compileComponentSchema(definition, ref), resolver, context);
      }
    }

    for (const registry of resource.parameterComponents) {
      for (const definition of registry.definitions) {
        const name = resolver.parameters.get(registry.ref[definition.key].id);
        if (name) parameters[name] = compileParameterComponent(definition, resolver);
      }
    }

    for (const registry of resource.requestBodyComponents) {
      for (const definition of registry.definitions) {
        const name = resolver.requestBodies.get(registry.ref[definition.name].id);
        if (name) requestBodies[name] = compileRequestBodyComponent(definition, resolver);
      }
    }

    for (const registry of resource.responseComponents) {
      for (const definition of registry.definitions) {
        const name = resolver.responses.get(registry.ref[definition.name].id);
        if (name) responses[name] = compileResponseComponent(definition, resolver);
      }
    }
  }

  return {
    components: {
      schemas,
      parameters,
      requestBodies,
      responses,
    },
    resolver,
  };
}

function isPropertyRefGroup(value: unknown): value is PropertyRefGroup {
  return !!value && typeof value === 'object' && !('model' in value) && !('publicModel' in value);
}

function isEntityRefs(value: unknown): value is {
  model: Parameters<typeof compileModelSchema>[0];
  publicModel: Parameters<typeof compileModelSchema>[0];
  partialModel: Parameters<typeof compileModelSchema>[0];
  query: {
    exact: Parameters<typeof compileModelSchema>[0];
    search: Parameters<typeof compileModelSchema>[0];
    exactSearch: Parameters<typeof compileModelSchema>[0];
    range: Parameters<typeof compileModelSchema>[0];
    in: Parameters<typeof compileModelSchema>[0];
    exists: Parameters<typeof compileModelSchema>[0];
    sort: Parameters<typeof compileModelSchema>[0];
    select: Parameters<typeof compileModelSchema>[0];
  };
} {
  return !!value && typeof value === 'object' && 'model' in value && 'publicModel' in value && 'partialModel' in value && 'query' in value;
}
