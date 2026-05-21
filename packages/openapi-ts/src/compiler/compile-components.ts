import type { OpenApiComponents } from "../openapi/openapi.types.js";
import type { VersionContract } from "../version/version-contract.types.js";
import { buildSchemaResolver } from "./schemas/build-schema-resolver.js";
import { compileComponentSchema } from "./schemas/compile-component-schema.js";
import { compileModelSchema } from "./schemas/compile-model-schema.js";
import { compilePropertySchema } from "./schemas/compile-property-schema.js";
import { resolvePendingRefs } from "./refs/resolve-pending-refs.js";

export interface CompiledComponentsResult {
  readonly components: OpenApiComponents;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
}

export function compileComponents(
  contract: VersionContract,
): CompiledComponentsResult {
  const resolver = buildSchemaResolver(
    contract.resources,
    contract.properties,
    contract.components,
  );

  const schemas: Record<string, unknown> = {};

  for (const registry of contract.components) {
    for (const definition of registry.definitions) {
      const ref = registry.ref[definition.name];
      schemas[resolver.schemas.get(ref.id) ?? definition.name] =
        resolvePendingRefs(compileComponentSchema(definition, ref), resolver);
    }
  }

  for (const resource of contract.resources) {
    for (const registry of resource.properties) {
      for (const value of Object.values(registry.ref)) {
        if (!isEntityRefs(value)) continue;

        for (const [key, fieldRef] of Object.entries(value.fields)) {
          const name = resolver.schemas.get(fieldRef.id);
          const sourceField = value.model.sourceFields?.[key];

          if (!name || !sourceField) continue;

          schemas[name] = resolvePendingRefs(
            compilePropertySchema(sourceField),
            resolver,
          );
        }

        for (const modelRef of [
          value.model,
          value.publicModel,
          value.selectedModel,
          value.partialModel,
        ]) {
          const name = resolver.schemas.get(modelRef.id);
          if (!name) continue;

          schemas[name] = resolvePendingRefs(
            compileModelSchema(modelRef),
            resolver,
          );
        }
      }
    }

    for (const registry of resource.components) {
      for (const definition of registry.definitions) {
        const ref = registry.ref[definition.name];
        const name = resolver.schemas.get(ref.id);

        if (!name) continue;

        schemas[name] = resolvePendingRefs(
          compileComponentSchema(definition, ref),
          resolver,
        );
      }
    }
  }

  const components: OpenApiComponents = { schemas };

  return {
    components,
    resolver,
  };
}

function isEntityRefs(value: unknown): value is {
  model: Parameters<typeof compileModelSchema>[0];
  publicModel: Parameters<typeof compileModelSchema>[0];
  selectedModel: Parameters<typeof compileModelSchema>[0];
  partialModel: Parameters<typeof compileModelSchema>[0];
} {
  return (
    !!value &&
    typeof value === "object" &&
    "model" in value &&
    "publicModel" in value &&
    "selectedModel" in value &&
    "partialModel" in value
  );
}
