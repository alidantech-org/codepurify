import type { SchemaComponentRegistry } from '../../components/schemas/schema-component.types.js';
import type { ParameterComponentRegistry } from '../../components/parameters/parameter-component.types.js';
import type { RequestBodyComponentRegistry } from '../../components/request-bodies/request-body-component.types.js';
import type { ResponseComponentRegistry } from '../../components/responses/response-component.types.js';
import type { CompilerContext } from '../compiler-context.js';
import { componentRefToSchemaName, modelRefToSchemaName } from '../../naming/ref-schema-name.js';
import type {
  EntityPropertyRefs,
  PropertyDefinition,
  PropertyRefGroup,
  PropertyRegistry,
  PropertyRegistryRef,
} from '../../properties/property.types.js';
import type { PropertyRef } from '../../refs/ref.types.js';
import type { ResourceBuilder } from '../../resource/define-resource.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import { toSchemaName } from '../../naming/schema-name.js';

export function buildSchemaResolver(
  resources: readonly ResourceBuilder[],
  properties: readonly PropertyRegistry[],
  schemaComponents: readonly SchemaComponentRegistry[],
  parameterComponents: readonly ParameterComponentRegistry[],
  requestBodyComponents: readonly RequestBodyComponentRegistry[],
  responseComponents: readonly ResponseComponentRegistry[],
  context?: CompilerContext,
): RefResolver {
  const schemas = new Map<string, string>();
  const parameters = new Map<string, string>();
  const requestBodies = new Map<string, string>();
  const responses = new Map<string, string>();

  for (const registry of properties) {
    registerPropertyRegistry(registry, schemas);
  }

  for (const registry of schemaComponents) {
    registerComponentRegistry(registry, schemas);
  }

  for (const registry of parameterComponents) {
    registerRefRegistry(registry.ref, parameters);
  }

  for (const registry of requestBodyComponents) {
    registerRefRegistry(registry.ref, requestBodies);
  }

  for (const registry of responseComponents) {
    registerRefRegistry(registry.ref, responses);
  }

  for (const resource of resources) {
    for (const registry of resource.properties) {
      registerPropertyRegistry(registry, schemas);
    }

    for (const registry of resource.schemaComponents) {
      registerComponentRegistry(registry, schemas);
    }

    for (const registry of resource.parameterComponents) {
      registerRefRegistry(registry.ref, parameters);
    }

    for (const registry of resource.requestBodyComponents) {
      registerRefRegistry(registry.ref, requestBodies);
    }

    for (const registry of resource.responseComponents) {
      registerRefRegistry(registry.ref, responses);
    }
  }

  return { schemas, parameters, requestBodies, responses };
}

function registerComponentRegistry(registry: SchemaComponentRegistry, schemas: Map<string, string>): void {
  for (const ref of Object.values(registry.ref)) {
    schemas.set(ref.id, componentRefToSchemaName(ref));
  }
}

function registerPropertyRegistry(registry: PropertyRegistry, schemas: Map<string, string>): void {
  for (const [groupName, value] of Object.entries(registry.ref)) {
    const definition = registry.definitions.find((d) => d.name === groupName);
    registerPropertyRegistryRef(groupName, value, schemas, definition);
  }
}

function registerPropertyRegistryRef(
  groupName: string,
  value: PropertyRegistryRef,
  schemas: Map<string, string>,
  definition: PropertyRegistry['definitions'][number] | undefined,
): void {
  if (definition?.emitSchema && isPropertyRefGroup(value)) {
    schemas.set(toSchemaName(groupName), toSchemaName(groupName));
  }

  if (isEntityRefs(value)) {
    for (const [key, ref] of Object.entries(value.fields)) {
      if (registerAliasRef(ref, schemas)) continue;
      schemas.set(ref.id, toSchemaName(groupName, key));
    }

    schemas.set(value.model.id, modelRefToSchemaName(value.model));
    schemas.set(value.publicModel.id, modelRefToSchemaName(value.publicModel));
    schemas.set(value.selectedModel.id, modelRefToSchemaName(value.selectedModel));
    schemas.set(value.partialModel.id, modelRefToSchemaName(value.partialModel));
    schemas.set(value.query.exact.id, modelRefToSchemaName(value.query.exact));
    schemas.set(value.query.search.id, modelRefToSchemaName(value.query.search));
    schemas.set(value.query.exactSearch.id, modelRefToSchemaName(value.query.exactSearch));
    schemas.set(value.query.range.id, modelRefToSchemaName(value.query.range));
    schemas.set(value.query.in.id, modelRefToSchemaName(value.query.in));
    schemas.set(value.query.exists.id, modelRefToSchemaName(value.query.exists));
    schemas.set(value.query.sort.id, modelRefToSchemaName(value.query.sort));
    return;
  }

  if (isPropertyRefGroup(value)) {
    for (const [key, ref] of Object.entries(value)) {
      if (registerAliasRef(ref, schemas)) continue;
      schemas.set(ref.id, toSchemaName(groupName, key));
    }
  }
}

function registerRefRegistry(refs: Record<string, { id: string; name: string }>, target: Map<string, string>): void {
  for (const ref of Object.values(refs)) {
    target.set(ref.id, ref.name);
  }
}

function isEntityRefs(value: PropertyRegistryRef): value is EntityPropertyRefs {
  return !!value && typeof value === 'object' && 'fields' in value && 'model' in value && 'publicModel' in value;
}

function isPropertyRefGroup(value: PropertyRegistryRef): value is PropertyRefGroup {
  return !!value && typeof value === 'object' && !isEntityRefs(value);
}

function registerAliasRef(ref: PropertyRef, schemas: Map<string, string>): boolean {
  if (!ref.targetRefId) return false;

  const targetName = schemas.get(ref.targetRefId);

  if (targetName) {
    schemas.set(ref.id, targetName);
    return true;
  }

  return false;
}
