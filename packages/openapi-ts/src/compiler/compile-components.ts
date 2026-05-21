import type { OpenApiComponents } from '../openapi/openapi.types.js';
import type { VersionContract } from '../version/version-contract.types.js';
import type { PropertyRefGroup } from '../properties/property.types.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';
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

export interface CompiledComponentsResult {
  readonly components: OpenApiComponents;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
}

export function compileComponents(contract: VersionContract): CompiledComponentsResult {
  const resolver = buildSchemaResolver(
    contract.resources,
    contract.properties,
    contract.schemaComponents,
    contract.parameterComponents,
    contract.requestBodyComponents,
    contract.responseComponents,
  );

  const schemas: Record<string, unknown> = {};
  const parameters: Record<string, unknown> = {};
  const requestBodies: Record<string, unknown> = {};
  const responses: Record<string, unknown> = {};

  for (const registry of contract.schemaComponents) {
    for (const definition of registry.definitions) {
      const ref = registry.ref[definition.name];
      schemas[resolver.schemas.get(ref.id) ?? definition.name] = resolvePendingRefs(compileComponentSchema(definition, ref), resolver);
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

            schemas[schemaName] = resolvePendingRefs(compilePropertyGroupSchema(definition, groupRefs, resolver), resolver);
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

            schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver);
          }

          continue;
        }

        if (!isEntityRefs(value)) continue;

        for (const [key, fieldRef] of Object.entries(value.fields)) {
          if (fieldRef.targetRefId) continue;

          const name = resolver.schemas.get(fieldRef.id);
          const sourceField = value.model.sourceFields?.[key];

          if (!name || !sourceField) continue;

          schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver);
        }

        const modelsToEmit = value.abstract ? [value.model] : [value.publicModel, value.selectedModel];

        for (const modelRef of modelsToEmit) {
          const name = resolver.schemas.get(modelRef.id);
          if (!name) continue;

          schemas[name] = resolvePendingRefs(compileModelSchema(modelRef), resolver);
        }
      }
    }

    for (const registry of resource.schemaComponents) {
      for (const definition of registry.definitions) {
        const ref = registry.ref[definition.name];
        const name = resolver.schemas.get(ref.id);

        if (!name) continue;

        schemas[name] = resolvePendingRefs(compileComponentSchema(definition, ref), resolver);
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
  selectedModel: Parameters<typeof compileModelSchema>[0];
  partialModel: Parameters<typeof compileModelSchema>[0];
} {
  return (
    !!value &&
    typeof value === 'object' &&
    'model' in value &&
    'publicModel' in value &&
    'selectedModel' in value &&
    'partialModel' in value
  );
}
