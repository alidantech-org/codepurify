import type { OpenApiComponents } from '../openapi/openapi.types.js';
import type { VersionContract } from '../version/version-contract.types.js';
import type { CompilerContext } from './compiler-context.js';

import type { EntityPropertyRefs, PropertyRefGroup } from '../properties/property.types.js';
import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';
import type { CompileQueryModelContext } from './schemas/compile-query-model-schema.js';

import { toSchemaName } from '../naming/schema-name.js';
import { buildSchemaResolver } from './schemas/build-schema-resolver.js';
import { compileComponentSchema } from './schemas/compile-component-schema.js';
import { compileModelSchema } from './schemas/compile-model-schema.js';
import { compileNamedPropertySchema } from './schemas/compile-named-property-schema.js';
import { compilePropertyGroupSchema } from './schemas/compile-property-group-schema.js';
import { compileParameterComponent } from './components/compile-parameter-component.js';
import { compileRequestBodyComponent } from './components/compile-request-body-component.js';
import { compileResponseComponent } from './components/compile-response-component.js';
import { resolvePendingRefs } from './refs/resolve-pending-refs.js';
import { applyCodegenMetadata } from '../sdk/apply-codegen-extensions.js';
import { XCodegenKind } from '../sdk/codegen-extension.types.js';

type SchemaResolver = ReturnType<typeof buildSchemaResolver>;
type CompilableModelRef = Parameters<typeof compileModelSchema>[0];

interface EntityModelEmission {
  readonly model: boolean;
  readonly publicModel: boolean;
  readonly internalModel: boolean;

  readonly partialModel: boolean;
  readonly publicPartialModel: boolean;
  readonly internalPartialModel: boolean;

  readonly query?: {
    readonly filter?: boolean;
    readonly sortValue?: boolean;
    readonly selectValue?: boolean;
  };
}

interface EntityRefs {
  readonly fields: Record<string, RefWithUsageMethods<PropertyRef>>;

  readonly model: CompilableModelRef;
  readonly publicModel: CompilableModelRef;
  readonly internalModel: CompilableModelRef;

  readonly partialModel: CompilableModelRef;
  readonly publicPartialModel: CompilableModelRef;
  readonly internalPartialModel: CompilableModelRef;

  readonly queryFilterModel: CompilableModelRef;

  readonly values: {
    readonly querySort: RefWithUsageMethods<PropertyRef>;
    readonly querySelect: RefWithUsageMethods<PropertyRef>;
  };

  readonly modelEmission: EntityModelEmission;
  readonly queryModelOptions: CompileQueryModelContext['queryModelOptions'];
}

export interface CompiledComponentsResult {
  readonly components: OpenApiComponents;
  readonly resolver: SchemaResolver;
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

  emitRootSchemaComponents(contract, schemas, resolver, context);
  emitRootParameterComponents(contract, parameters, resolver);
  emitRootRequestBodies(contract, requestBodies, resolver);
  emitRootResponses(contract, responses, resolver);

  for (const resource of contract.resources) {
    emitResourcePropertyComponents(resource.properties, schemas, resolver, context);
    emitResourceSchemaComponents(resource.schemaComponents, schemas, resolver, context);
    emitResourceParameterComponents(resource.parameterComponents, parameters, resolver);
    emitResourceRequestBodies(resource.requestBodyComponents, requestBodies, resolver);
    emitResourceResponses(resource.responseComponents, responses, resolver);
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

/* =========================================================
 * Root-level component emission
 * ========================================================= */

function emitRootSchemaComponents(
  contract: VersionContract,
  schemas: Record<string, unknown>,
  resolver: SchemaResolver,
  context: CompilerContext,
): void {
  for (const registry of contract.schemaComponents) {
    for (const definition of registry.definitions) {
      const ref = registry.ref[definition.name];
      const name = resolver.schemas.get(ref.id) ?? definition.name;

      schemas[name] = resolvePendingRefs(compileComponentSchema(definition, ref), resolver, context);
    }
  }
}

function emitRootParameterComponents(contract: VersionContract, parameters: Record<string, unknown>, resolver: SchemaResolver): void {
  for (const registry of contract.parameterComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.parameters.get(registry.ref[definition.key].id);
      if (!name) continue;

      parameters[name] = compileParameterComponent(definition, resolver);
    }
  }
}

function emitRootRequestBodies(contract: VersionContract, requestBodies: Record<string, unknown>, resolver: SchemaResolver): void {
  for (const registry of contract.requestBodyComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.requestBodies.get(registry.ref[definition.name].id);
      if (!name) continue;

      requestBodies[name] = compileRequestBodyComponent(definition, resolver);
    }
  }
}

function emitRootResponses(contract: VersionContract, responses: Record<string, unknown>, resolver: SchemaResolver): void {
  for (const registry of contract.responseComponents) {
    for (const definition of registry.definitions) {
      const name = resolver.responses.get(registry.ref[definition.name].id);
      if (!name) continue;

      responses[name] = compileResponseComponent(definition, resolver);
    }
  }
}

/* =========================================================
 * Resource-level component emission
 * ========================================================= */

function emitResourcePropertyComponents(
  propertyRegistries: VersionContract['resources'][number]['properties'],
  schemas: Record<string, unknown>,
  resolver: SchemaResolver,
  context: CompilerContext,
): void {
  for (const registry of propertyRegistries) {
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

      emitEntityValueSchemas({
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
}

function emitResourceSchemaComponents(
  schemaRegistries: VersionContract['resources'][number]['schemaComponents'],
  schemas: Record<string, unknown>,
  resolver: SchemaResolver,
  context: CompilerContext,
): void {
  for (const registry of schemaRegistries) {
    for (const definition of registry.definitions) {
      const ref = registry.ref[definition.name];
      const name = resolver.schemas.get(ref.id);

      if (!name) continue;

      schemas[name] = resolvePendingRefs(compileComponentSchema(definition, ref), resolver, context);
    }
  }
}

function emitResourceParameterComponents(
  parameterRegistries: VersionContract['resources'][number]['parameterComponents'],
  parameters: Record<string, unknown>,
  resolver: SchemaResolver,
): void {
  for (const registry of parameterRegistries) {
    for (const definition of registry.definitions) {
      const name = resolver.parameters.get(registry.ref[definition.key].id);
      if (!name) continue;

      parameters[name] = compileParameterComponent(definition, resolver);
    }
  }
}

function emitResourceRequestBodies(
  requestBodyRegistries: VersionContract['resources'][number]['requestBodyComponents'],
  requestBodies: Record<string, unknown>,
  resolver: SchemaResolver,
): void {
  for (const registry of requestBodyRegistries) {
    for (const definition of registry.definitions) {
      const name = resolver.requestBodies.get(registry.ref[definition.name].id);
      if (!name) continue;

      requestBodies[name] = compileRequestBodyComponent(definition, resolver);
    }
  }
}

function emitResourceResponses(
  responseRegistries: VersionContract['resources'][number]['responseComponents'],
  responses: Record<string, unknown>,
  resolver: SchemaResolver,
): void {
  for (const registry of responseRegistries) {
    for (const definition of registry.definitions) {
      const name = resolver.responses.get(registry.ref[definition.name].id);
      if (!name) continue;

      responses[name] = compileResponseComponent(definition, resolver);
    }
  }
}

/* =========================================================
 * Property and entity schema emission
 * ========================================================= */

function emitPropertyGroupNamedSchemas(input: {
  readonly value: PropertyRefGroup;
  readonly schemas: Record<string, unknown>;
  readonly resolver: SchemaResolver;
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
  readonly resolver: SchemaResolver;
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

/**
 * Emits entity value components.
 *
 * These are property refs, but they are generated from entity fields and are
 * intended to be reused by user-authored query DTOs:
 *
 * - {Entity}QuerySortValue
 * - {Entity}QuerySelectValue
 */
function emitEntityValueSchemas(input: {
  readonly value: EntityRefs;
  readonly schemas: Record<string, unknown>;
  readonly resolver: SchemaResolver;
  readonly context: CompilerContext;
}): void {
  const { value, schemas, resolver, context } = input;

  emitEntityValueSchema({
    ref: value.values.querySort,
    schemas,
    resolver,
    context,
  });

  emitEntityValueSchema({
    ref: value.values.querySelect,
    schemas,
    resolver,
    context,
  });
}

function emitEntityValueSchema(input: {
  readonly ref: RefWithUsageMethods<PropertyRef>;
  readonly schemas: Record<string, unknown>;
  readonly resolver: SchemaResolver;
  readonly context: CompilerContext;
}): void {
  const { ref, schemas, resolver } = input;

  const name = resolver.schemas.get(ref.id);
  if (!name) return;

  // Use generatedSchema for engine-generated virtual enum refs
  if (ref.generatedSchema?.kind === 'enum') {
    schemas[name] = applyCodegenMetadata(
      {
        type: 'string',
        enum: [...ref.generatedSchema.values],
      },
      {
        kind: XCodegenKind.enum,
        resource: ref.meta?.resource,
        entity: ref.meta?.entity,
      },
    );
    return;
  }

  throw new Error(`Unable to emit generated entity value schema "${name}". Missing generatedSchema for ref "${ref.id}".`);
}

/* =========================================================
 * Entity model emission
 * ========================================================= */

function emitEntityModelSchemas(input: {
  readonly value: EntityRefs;
  readonly schemas: Record<string, unknown>;
  readonly resolver: SchemaResolver;
  readonly context: CompilerContext;
}): void {
  const { value, schemas, resolver, context } = input;

  const queryModelContext: CompileQueryModelContext = {
    queryModelOptions: value.queryModelOptions,
  };

  const modelsToEmit = createEntityModelEmissionPlan(value);

  for (const item of modelsToEmit) {
    if (!item.enabled) continue;

    emitModelSchema({
      ref: item.ref,
      queryModelContext,
      schemas,
      resolver,
      context,
    });
  }
}

function createEntityModelEmissionPlan(value: EntityRefs): readonly {
  readonly ref: CompilableModelRef;
  readonly enabled: boolean;
}[] {
  return [
    {
      ref: value.model,
      enabled: value.modelEmission.model,
    },
    {
      ref: value.publicModel,
      enabled: value.modelEmission.publicModel,
    },
    {
      ref: value.internalModel,
      enabled: value.modelEmission.internalModel,
    },
    {
      ref: value.partialModel,
      enabled: value.modelEmission.partialModel,
    },
    {
      ref: value.publicPartialModel,
      enabled: value.modelEmission.publicPartialModel,
    },
    {
      ref: value.internalPartialModel,
      enabled: value.modelEmission.internalPartialModel,
    },
    {
      ref: value.queryFilterModel,
      enabled: value.modelEmission.query?.filter ?? true,
    },
  ];
}

function emitModelSchema(input: {
  readonly ref: CompilableModelRef;
  readonly queryModelContext: CompileQueryModelContext;
  readonly schemas: Record<string, unknown>;
  readonly resolver: SchemaResolver;
  readonly context: CompilerContext;
}): void {
  const { ref, queryModelContext, schemas, resolver, context } = input;

  const name = resolver.schemas.get(ref.id);
  if (!name) return;

  const modelResult = compileModelSchema(ref, queryModelContext);

  schemas[name] = resolvePendingRefs(modelResult.schema, resolver, context);

  if (!modelResult.enumComponents) return;

  for (const enumComponent of modelResult.enumComponents) {
    resolver.schemas.set(enumComponent.componentName, enumComponent.componentName);

    schemas[enumComponent.componentName] = resolvePendingRefs(enumComponent.schema, resolver, context);
  }
}

/* =========================================================
 * Guards
 * ========================================================= */

function isPropertyRefGroup(value: unknown): value is PropertyRefGroup {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !('model' in value) &&
    !('publicModel' in value) &&
    !('queryFilterModel' in value)
  );
}

function isEntityRefs(value: unknown): value is EntityRefs {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const candidate = value as Partial<EntityPropertyRefs>;

  return (
    !!candidate.fields &&
    !!candidate.model &&
    !!candidate.publicModel &&
    !!candidate.internalModel &&
    !!candidate.partialModel &&
    !!candidate.publicPartialModel &&
    !!candidate.internalPartialModel &&
    !!candidate.queryFilterModel &&
    !!candidate.values &&
    !!candidate.values.querySort &&
    !!candidate.values.querySelect &&
    !!candidate.modelEmission &&
    !!candidate.queryModelOptions
  );
}
