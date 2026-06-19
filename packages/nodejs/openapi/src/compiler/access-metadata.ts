import type { SchemaComponentDefinition, SchemaComponentRegistry } from '../components/schemas/schema-component.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';
import type { VersionContract } from '../version/version-contract.types.js';
import type { ResolvedCompilerContext } from './compiler-context.js';
import { RefKind } from '../refs/ref-kind.js';
import type { ComponentRef, PropertyRef } from '../refs/ref.types.js';
import { isRefUsage } from '../validation/ref-usage-guards.js';
import type { ArrayRef } from '../refs/ref-wrapper.types.js';

export function collectAccessMetadataFromContract(contract: VersionContract, context: ResolvedCompilerContext): void {
  const schemaDefinitionsByRefId = collectSchemaDefinitionsByRefId(contract);

  for (const registry of contract.accessComponents) {
    for (const definition of registry.definitions) {
      const contextRef = definition.context;

      if (!contextRef) continue;

      context.accessContextSchemaIds.add(contextRef.id);

      const schemaDefinition = schemaDefinitionsByRefId.get(contextRef.id);
      if (!schemaDefinition) continue;

      collectAccessRoleProperties(schemaDefinition, context);
    }
  }
}

function collectSchemaDefinitionsByRefId(contract: VersionContract): Map<string, SchemaComponentDefinition> {
  const map = new Map<string, SchemaComponentDefinition>();

  for (const registry of contract.schemaComponents) {
    addSchemaRegistryDefinitions(registry, map);
  }

  for (const resource of contract.resources) {
    for (const registry of resource.schemaComponents) {
      addSchemaRegistryDefinitions(registry, map);
    }
  }

  return map;
}

function addSchemaRegistryDefinitions(registry: SchemaComponentRegistry, map: Map<string, SchemaComponentDefinition>): void {
  for (const definition of registry.definitions) {
    const ref = registry.ref[definition.name];
    if (ref) {
      map.set(ref.id, definition);
    }
  }
}

function collectAccessRoleProperties(definition: SchemaComponentDefinition, context: ResolvedCompilerContext): void {
  const fields = definition.value as ComponentFieldMap;

  if (!fields || typeof fields !== 'object' || Array.isArray(fields) || 'ref' in fields || 'kind' in fields) {
    return;
  }

  for (const [key, value] of Object.entries(fields)) {
    if (key !== 'systemRoles' && key !== 'tenantRoles') continue;

    const propertyRef = unwrapPropertyRef(value);
    if (propertyRef) {
      context.accessRolePropertyIds.add(propertyRef.id);
    }
  }
}

function unwrapPropertyRef(value: unknown): PropertyRef | undefined {
  const ref = isRefUsage(value) ? value.ref : value;

  if (isPropertyRef(ref)) return ref;

  if (isArrayRef(ref) && isPropertyRef(ref.ref)) {
    return ref.ref;
  }

  return undefined;
}

function isPropertyRef(value: unknown): value is PropertyRef {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === RefKind.property;
}

function isArrayRef(value: unknown): value is ArrayRef<ComponentRef | PropertyRef> {
  return !!value && typeof value === 'object' && (value as { kind?: unknown }).kind === 'array-ref' && 'ref' in value;
}
