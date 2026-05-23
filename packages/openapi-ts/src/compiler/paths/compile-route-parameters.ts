import type { ComponentFieldMap } from '../../components/component.types.js';
import type { RouteParameterRef, RouteParameterMap, RouteParameterFieldValue, RouteQueryInput } from '../../routes/route.types.js';
import type { RefResolver } from '../refs/ref-resolver.types.js';
import type { ComponentRef, ModelRef, PropertyRef } from '../../refs/ref.types.js';
import type { RefUsage } from '../../refs/ref-usage.types.js';
import type { FieldSourceMetadata } from '../../refs/ref-usage.types.js';
import type { SchemaComponentValue } from '../../components/schemas/schema-component.types.js';
import type { SchemaComponentRegistry } from '../../components/schemas/schema-component.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import type { CompilerContext } from '../compiler-context.js';
import { RefKind } from '../../refs/ref-kind.js';
import { compileRouteSchema } from './compile-route-schema.js';
import { isRefUsage, getRefRequired } from '../../validation/ref-usage-guards.js';
import { isEngineRef, isPropertyRef, isComponentRef } from '../../validation/ref-guards.js';
import {
  normalizeExtendWithInput,
  normalizeExtendWithForQueryCollection,
  normalizeExtendWithInputWithSource,
} from '../schemas/normalize-extend-with.js';
import { getSourceMetadataFromRef } from '../../refs/ref-source-metadata.js';

export interface CollectedQueryField {
  readonly name: string;
  readonly field: RouteParameterFieldValue;
  readonly required: boolean;

  readonly source: FieldSourceMetadata;
}

export function compileRouteParameters(
  schema: RouteParameterRef | RouteParameterMap | RouteQueryInput | undefined,
  location: 'path' | 'query',
  resolver: RefResolver,
  contract?: VersionContract,
  useInlineExpansion = false,
): unknown[] {
  if (!schema) return [];

  // Handle ComponentRef or RefUsage<ComponentRef> for query
  if (location === 'query' && isComponentRefInput(schema)) {
    if (useInlineExpansion) {
      return compileComponentRefQueryParameters(schema, resolver, contract);
    }
    // When not using inline expansion, return empty - parameters will be inferred as components
    return [];
  }

  // Handle RouteParameterMap (new type)
  if (isParameterMap(schema)) {
    return Object.entries(schema).map(([name, param]) => ({
      name,
      in: location,
      required: location === 'path' ? true : !isOptional(param),
      schema: compileParameterField(param, resolver),
    }));
  }

  // Legacy ComponentFieldMap handling - only if it's actually a field map
  if (isComponentFieldMap(schema)) {
    const compiled = compileRouteSchema(schema, resolver);
    const objectSchema = unwrapObjectSchema(compiled);

    if (!objectSchema?.properties) return [];

    return Object.entries(objectSchema.properties).map(([name, property]) => ({
      name,
      in: location,
      required: location === 'path' ? true : isRequired(name, objectSchema.required),
      schema: property,
    }));
  }

  return [];
}

function compileParameterField(param: RouteParameterFieldValue, resolver: RefResolver): unknown {
  const ref = isRefUsage(param) ? param.ref : param;
  const nullable = isRefUsage(param) ? param.nullable : undefined;

  if (!ref.id) {
    throw new Error(`Cannot create query parameter schema: missing ref id.`);
  }

  const schema = { $ref: `#pending/${ref.id}` };

  if (nullable) {
    return {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function isOptional(param: RouteParameterFieldValue): boolean {
  const required = isRefUsage(param) ? getRefRequired(param) : undefined;
  return required === false;
}

function isParameterMap(value: unknown): value is RouteParameterMap {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !('schema' in value) && !('kind' in value);
}

function unwrapObjectSchema(value: unknown): { properties?: Record<string, unknown>; required?: string[] } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  if ('properties' in value) return value as { properties?: Record<string, unknown>; required?: string[] };
  return undefined;
}

function isRequired(name: string, required: string[] | undefined): boolean {
  return required?.includes(name) ?? false;
}

function isComponentRefInput(value: unknown): value is ComponentRef | RefUsage<ComponentRef> {
  if (!value || typeof value !== 'object') return false;
  if ('kind' in value && value.kind === RefKind.component) return true;
  if (isRefUsage(value) && 'ref' in value && value.ref.kind === RefKind.component) return true;
  return false;
}

function compileComponentRefQueryParameters(
  schema: ComponentRef | RefUsage<ComponentRef>,
  resolver: RefResolver,
  contract?: VersionContract,
  context?: CompilerContext,
): unknown[] {
  const ref = isRefUsage(schema) ? schema.ref : schema;
  const componentRef = ref as ComponentRef;

  // Find the component definition from the contract
  const definition = findSchemaComponentDefinition(componentRef.id, contract);
  if (!definition) {
    throw new Error(`Unable to expand query component ref ${componentRef.id}: component definition not found`);
  }

  // Collect query fields from the component value
  const fieldMap = collectQueryFieldsFromSchemaComponentValue(definition.value, contract);

  // Convert field map to query parameters
  return Object.entries(fieldMap).map(([name, param]) => {
    // Validate that each field is a PropertyRef or RefUsage<PropertyRef>
    if (!isPropertyRef(param) && !(isRefUsage(param) && isPropertyRef(param.ref))) {
      throw new Error(
        `Query component field "${name}" must resolve to a PropertyRef or RefUsage<PropertyRef>. Got: ${typeof param === 'object' && 'kind' in param ? (param as { kind: string }).kind : typeof param}`,
      );
    }

    const validatedParam = param as RouteParameterFieldValue;

    return {
      name,
      in: 'query',
      required: isRequiredForQuery(validatedParam),
      schema: compileParameterField(validatedParam, resolver),
    };
  });
}

function findSchemaComponentDefinition(
  refId: string,
  contract?: VersionContract,
): { name: string; value: SchemaComponentValue; isShared?: boolean } | undefined {
  if (!contract) return undefined;

  // Search shared schema components
  for (const registry of contract.schemaComponents) {
    for (const definition of registry.definitions) {
      const componentRef = registry.ref[definition.name];
      if (componentRef.id === refId) {
        return { ...definition, isShared: true };
      }
    }
  }

  // Search resource schema components
  for (const resource of contract.resources) {
    for (const registry of resource.schemaComponents) {
      for (const definition of registry.definitions) {
        const componentRef = registry.ref[definition.name];
        if (componentRef.id === refId) {
          return { ...definition, isShared: false };
        }
      }
    }
  }

  return undefined;
}

export function collectQueryFieldsFromSchemaComponentValue(
  value: SchemaComponentValue,
  contract?: VersionContract,
  sourceSchema?: string,
  baseSource?: FieldSourceMetadata,
): CollectedQueryField[] {
  // Handle plain field map
  if (isComponentFieldMap(value)) {
    const result: CollectedQueryField[] = [];
    for (const [name, field] of Object.entries(value)) {
      if (!isPropertyRef(field) && !(isRefUsage(field) && isPropertyRef(field.ref))) {
        throw new Error(
          `Query component field "${name}" must be a PropertyRef or RefUsage<PropertyRef>. Got: ${typeof field === 'object' && 'kind' in field ? (field as { kind: string }).kind : typeof field}`,
        );
      }
      const fieldRef = isPropertyRef(field) ? field : (field as RefUsage<PropertyRef>).ref;

      // For inline field maps, derive source from the actual PropertyRef
      // This prevents inline resource fields from being treated as shared
      let source: FieldSourceMetadata;
      if (baseSource && baseSource.origin !== 'inline') {
        // Use provided base source if it's not inline (e.g., from base component)
        source = baseSource;
      } else {
        // Derive from the actual PropertyRef for inline maps
        source = getSourceMetadataFromRef(fieldRef, 'inline');
      }

      result.push({
        name,
        field: field as RouteParameterFieldValue,
        required: isRequiredForQuery(field as RouteParameterFieldValue),
        source: {
          ...source,
          propertyRefId: fieldRef.id,
          fieldKey: fieldRef.propertyKey,
          propertyResource: fieldRef.meta?.resource,
        },
      });
    }
    return result;
  }

  // Handle EngineRef (direct ref alias)
  if (isEngineRef(value)) {
    if (value.kind === 'component') {
      const definition = findSchemaComponentDefinition(value.id, contract);
      if (definition) {
        const componentSource = getSourceMetadataFromRef(value, 'base');
        return collectQueryFieldsFromSchemaComponentValue(definition.value, contract, definition.name, componentSource);
      }
    }
    throw new Error(`Cannot expand query component with ref kind: ${value.kind}`);
  }

  // Handle RefUsage<ComponentRef> (extendWith on component ref)
  if (isRefUsage(value) && isComponentRef(value.ref)) {
    const definition = findSchemaComponentDefinition(value.ref.id, contract);
    if (definition) {
      const baseSource = value.usage.composition?.base ?? getSourceMetadataFromRef(value.ref, 'base');
      const baseFields = collectQueryFieldsFromSchemaComponentValue(definition.value, contract, definition.name, baseSource);
      const extensionFields = normalizeExtendWithInputWithSource(value.usage.extendWith);
      if (extensionFields) {
        // Filter and validate extension fields to only include PropertyRef
        for (const [name, field] of Object.entries(extensionFields.fields)) {
          if (!isPropertyRef(field) && !(isRefUsage(field) && isPropertyRef(field.ref))) {
            throw new Error(
              `Query component extension field "${name}" must be a PropertyRef or RefUsage<PropertyRef>. Got: ${typeof field === 'object' && 'kind' in field ? (field as { kind: string }).kind : typeof field}`,
            );
          }

          const fieldRef = isPropertyRef(field) ? field : (field as RefUsage<PropertyRef>).ref;
          baseFields.push({
            name,
            field: field as RouteParameterFieldValue,
            required: isRequiredForQuery(field as RouteParameterFieldValue),
            source: {
              ...extensionFields.source,
              origin: extensionFields.source?.origin ?? 'extension',
              propertyRefId: fieldRef.id,
              fieldKey: fieldRef.propertyKey,
              propertyResource: fieldRef.meta?.resource,
            },
          });
        }
      }
      return baseFields;
    }
    throw new Error(`Cannot find component definition for ref: ${value.ref.id}`);
  }

  // Handle RefUsage<EngineRef> (extendWith on other refs)
  if (isRefUsage(value)) {
    const baseSource = value.usage.composition?.base ?? getSourceMetadataFromRef(value.ref, 'base');
    const baseFields = collectQueryFieldsFromSchemaComponentValue(value.ref, contract, sourceSchema, baseSource);
    const extensionFields = normalizeExtendWithInputWithSource(value.usage.extendWith);
    if (extensionFields) {
      // Filter and validate extension fields to only include PropertyRef
      for (const [name, field] of Object.entries(extensionFields.fields)) {
        if (!isPropertyRef(field) && !(isRefUsage(field) && isPropertyRef(field.ref))) {
          throw new Error(
            `Query component extension field "${name}" must be a PropertyRef or RefUsage<PropertyRef>. Got: ${typeof field === 'object' && 'kind' in field ? (field as { kind: string }).kind : typeof field}`,
          );
        }

        const fieldRef = isPropertyRef(field) ? field : (field as RefUsage<PropertyRef>).ref;
        baseFields.push({
          name,
          field: field as RouteParameterFieldValue,
          required: isRequiredForQuery(field as RouteParameterFieldValue),
          source: {
            ...extensionFields.source,
            origin: extensionFields.source?.origin ?? 'extension',
            propertyRefId: fieldRef.id,
            fieldKey: fieldRef.propertyKey,
            propertyResource: fieldRef.meta?.resource,
          },
        });
      }
    }
    return baseFields;
  }

  return [];
}

function isComponentFieldMap(value: unknown): value is ComponentFieldMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isEngineRef(value)) return false;
  if (isRefUsage(value)) return false;
  return true;
}

export function isRequiredForQuery(param: RouteParameterFieldValue): boolean {
  // Default to optional for query params
  const required = isRefUsage(param) ? getRefRequired(param) : undefined;
  return required === true;
}
