import type { OpenApiComponents } from '../openapi/openapi.types.js';
import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext } from './compiler-context.js';
import type { PropertyRefGroup } from '../properties/property.types.js';
import type { PropertyRef } from '../refs/ref.types.js';
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

type CompilableModelRef = Parameters<typeof compileModelSchema>[0];

interface EntityModelEmission {
  readonly model: boolean;
  readonly publicModel: boolean;
  readonly privateModel: boolean;
  readonly internalModel: boolean;
  readonly systemModel: boolean;
  readonly partialModel: boolean;
  readonly publicPartialModel: boolean;
  readonly privatePartialModel: boolean;
  readonly internalPartialModel: boolean;
  readonly systemPartialModel: boolean;
  readonly query: {
    readonly exact: boolean;
    readonly search: boolean;
    readonly exactSearch: boolean;
    readonly range: boolean;
    readonly in: boolean;
    readonly exists: boolean;
    readonly sort: boolean;
    readonly select: boolean;
  };
}

interface EntityRefs {
  readonly fields: Record<string, PropertyRef>;

  readonly model: CompilableModelRef;
  readonly publicModel: CompilableModelRef;
  readonly privateModel: CompilableModelRef;
  readonly internalModel: CompilableModelRef;
  readonly systemModel: CompilableModelRef;

  readonly partialModel: CompilableModelRef;
  readonly publicPartialModel: CompilableModelRef;
  readonly privatePartialModel: CompilableModelRef;
  readonly internalPartialModel: CompilableModelRef;
  readonly systemPartialModel: CompilableModelRef;

  readonly query: {
    readonly exact: CompilableModelRef;
    readonly search: CompilableModelRef;
    readonly exactSearch: CompilableModelRef;
    readonly range: CompilableModelRef;
    readonly in: CompilableModelRef;
    readonly exists: CompilableModelRef;
    readonly sort: CompilableModelRef;
    readonly select: CompilableModelRef;
  };

  readonly modelEmission: EntityModelEmission;
  readonly queryModelOptions: CompileQueryModelContext['queryModelOptions'];
}

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
        if (!definition.emitSchema) continue;

        const groupRefs = registry.ref[definition.name];

        if (!isPropertyRefGroup(groupRefs)) continue;

        const schemaName = toSchemaName(definition.name);

        schemas[schemaName] = resolvePendingRefs(compilePropertyGroupSchema(definition, groupRefs, resolver), resolver, context);
      }

      for (const value of Object.values(registry.ref)) {
        if (isPropertyRefGroup(value)) {
          emitPropertyGroupNamedSchemas({
            value,
            schemas,
            resolver,
            context,
            definitions: registry.definitions,
          });

          continue;
        }

        if (!isEntityRefs(value)) continue;

        emitEntityNamedPropertySchemas({
          value,
          schemas,
          resolver,
          context,
        });

        emitEntityModelSchemas({
          value,
          schemas,
          resolver,
          context,
        });
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

function emitPropertyGroupNamedSchemas(input: {
  readonly value: PropertyRefGroup;
  readonly schemas: Record<string, unknown>;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
  readonly context: CompilerContext;
  readonly definitions: readonly { readonly fields: unknown }[];
}): void {
  const { value, schemas, resolver, context, definitions } = input;

  for (const [key, fieldRef] of Object.entries(value)) {
    if (fieldRef.targetRefId) continue;

    const name = resolver.schemas.get(fieldRef.id);

    const definition = definitions.find((item) => {
      return key in (item.fields as Record<string, unknown>);
    });

    const sourceField = (definition?.fields as Record<string, unknown>)?.[key] as SchemaFieldMap[string] | undefined;

    if (!name || !sourceField) continue;

    schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver, context);
  }
}

function emitEntityNamedPropertySchemas(input: {
  readonly value: EntityRefs;
  readonly schemas: Record<string, unknown>;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
  readonly context: CompilerContext;
}): void {
  const { value, schemas, resolver, context } = input;

  for (const [key, fieldRef] of Object.entries(value.fields)) {
    if (fieldRef.targetRefId) continue;

    const name = resolver.schemas.get(fieldRef.id);
    const sourceField = value.model.sourceFields?.[key];

    if (!name || !sourceField) continue;

    schemas[name] = resolvePendingRefs(compileNamedPropertySchema(sourceField, fieldRef), resolver, context);
  }
}

function emitEntityModelSchemas(input: {
  readonly value: EntityRefs;
  readonly schemas: Record<string, unknown>;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
  readonly context: CompilerContext;
}): void {
  const { value, schemas, resolver, context } = input;

  const queryModelContext: CompileQueryModelContext = {
    queryModelOptions: value.queryModelOptions,
  };

  const modelsToEmit: Array<{
    readonly ref: CompilableModelRef;
    readonly enabled: boolean;
  }> = [
    { ref: value.model, enabled: value.modelEmission.model },
    { ref: value.publicModel, enabled: value.modelEmission.publicModel },
    { ref: value.privateModel, enabled: value.modelEmission.privateModel },
    { ref: value.internalModel, enabled: value.modelEmission.internalModel },
    { ref: value.systemModel, enabled: value.modelEmission.systemModel },

    { ref: value.partialModel, enabled: value.modelEmission.partialModel },
    { ref: value.publicPartialModel, enabled: value.modelEmission.publicPartialModel },
    { ref: value.privatePartialModel, enabled: value.modelEmission.privatePartialModel },
    { ref: value.internalPartialModel, enabled: value.modelEmission.internalPartialModel },
    { ref: value.systemPartialModel, enabled: value.modelEmission.systemPartialModel },

    { ref: value.query.exact, enabled: value.modelEmission.query.exact },
    { ref: value.query.search, enabled: value.modelEmission.query.search },
    { ref: value.query.exactSearch, enabled: value.modelEmission.query.exactSearch },
    { ref: value.query.range, enabled: value.modelEmission.query.range },
    { ref: value.query.in, enabled: value.modelEmission.query.in },
    { ref: value.query.exists, enabled: value.modelEmission.query.exists },
    { ref: value.query.sort, enabled: value.modelEmission.query.sort },
    { ref: value.query.select, enabled: value.modelEmission.query.select },
  ];

  for (const { ref, enabled } of modelsToEmit) {
    if (!enabled) continue;

    emitModelSchema({
      ref,
      queryModelContext,
      schemas,
      resolver,
      context,
    });
  }
}

function emitModelSchema(input: {
  readonly ref: CompilableModelRef;
  readonly queryModelContext: CompileQueryModelContext;
  readonly schemas: Record<string, unknown>;
  readonly resolver: ReturnType<typeof buildSchemaResolver>;
  readonly context: CompilerContext;
}): void {
  const { ref, queryModelContext, schemas, resolver, context } = input;

  const name = resolver.schemas.get(ref.id);
  if (!name) return;

  const modelResult = compileModelSchema(ref, queryModelContext);

  if (modelResult.enumComponents) {
    for (const enumComponent of modelResult.enumComponents) {
      resolver.schemas.set(enumComponent.componentName, enumComponent.componentName);
    }
  }

  schemas[name] = resolvePendingRefs(modelResult.schema, resolver, context);

  if (modelResult.enumComponents) {
    for (const enumComponent of modelResult.enumComponents) {
      schemas[enumComponent.componentName] = resolvePendingRefs(enumComponent.schema, resolver, context);
    }
  }
}

function isPropertyRefGroup(value: unknown): value is PropertyRefGroup {
  return !!value && typeof value === 'object' && !('model' in value) && !('publicModel' in value);
}

function isEntityRefs(value: unknown): value is EntityRefs {
  return (
    !!value &&
    typeof value === 'object' &&
    'fields' in value &&
    'model' in value &&
    'publicModel' in value &&
    'privateModel' in value &&
    'internalModel' in value &&
    'systemModel' in value &&
    'partialModel' in value &&
    'publicPartialModel' in value &&
    'privatePartialModel' in value &&
    'internalPartialModel' in value &&
    'systemPartialModel' in value &&
    'query' in value &&
    'modelEmission' in value &&
    'queryModelOptions' in value
  );
}
