// src/contract/builders/define-properties.ts

import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { PrimitiveDefinition } from '@/contract/types/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/properties/composite/definition';
import type { EntityDefinition } from '@/contract/types/schema/entity/definition';
import type { EntityField } from '@/contract/types/schema/entity/field/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { EntityFieldAuthoringRef, PropertyAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  EntityFieldInputMap,
  EntityOptions,
  EntityPropertiesResult,
  ForRefPropertiesResult,
  PropertiesBuilder,
  PropertySourceInput,
  PropertySourceMap,
  SharedPropertiesResult,
} from '@/contract/types/core/4.properties-builder';

import { entityFieldRef, entityRef, modelRefs, propertyRefFromSource } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefinePropertiesOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Partial<PropertiesDefinition>;
  readonly schemas?: Partial<SchemasDefinition>;
}

// ============================================================================
// STATE HELPERS
// ============================================================================

function ensurePropertiesState(state: Partial<PropertiesDefinition>): PropertiesDefinition {
  state.primitives ??= {};
  state.enums ??= {};
  state.composites ??= {};

  return state as PropertiesDefinition;
}

function ensureSchemasState(state: Partial<SchemasDefinition>): Partial<SchemasDefinition> {
  state.entities ??= {};
  state.models ??= {};
  state.dtos ??= {};
  state.params ??= {};

  return state;
}

function writePropertySource(state: PropertiesDefinition, key: string, source: PropertySourceInput): void {
  if (source.kind === 'primitive') {
    state.primitives[key] = source as unknown as PrimitiveDefinition;
    return;
  }

  if (source.kind === 'enum') {
    state.enums[key] = source as unknown as EnumDefinition;
    return;
  }

  if (source.kind === 'composite') {
    state.composites[key] = source as unknown as CompositeDefinition;
  }
}

function writeEntitySource<TFields extends EntityFieldInputMap>(
  schemas: Partial<SchemasDefinition> | undefined,
  name: string,
  fields: TFields,
  options: EntityOptions,
): void {
  if (!schemas) return;

  const state = ensureSchemasState(schemas);

  state.entities![name] = {
    fields: fields as unknown as Record<string, EntityField>,
    extends: options.extends,
    tags: options.tags,
    description: options.description,
    deprecated: options.deprecated,
    meta: options.meta,
  } as unknown as EntityDefinition;
}

function createPropertyRefs<TFields extends PropertySourceMap>(fields: TFields): Record<keyof TFields & string, PropertyAuthoringRef> {
  const refs = {} as Record<keyof TFields & string, PropertyAuthoringRef>;

  for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
    refs[key] = propertyRefFromSource(key, value);
  }

  return refs;
}

function createEntityFieldRefs<TFields extends EntityFieldInputMap>(
  entityName: string,
  fields: TFields,
): Record<keyof TFields & string, EntityFieldAuthoringRef> {
  const refs = {} as Record<keyof TFields & string, EntityFieldAuthoringRef>;

  for (const key of Object.keys(fields) as Array<keyof TFields & string>) {
    refs[key] = entityFieldRef(entityName, key);
  }

  return refs;
}

function writePropertySources<TFields extends PropertySourceMap>(state: PropertiesDefinition, fields: TFields): void {
  for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
    writePropertySource(state, key, value);
  }
}

// ============================================================================
// DEFINE PROPERTIES
// ============================================================================

export function defineProperties(options: DefinePropertiesOptions): PropertiesBuilder {
  const builder: PropertiesBuilder = {
    get state() {
      return options.state;
    },

    shared<TFields extends PropertySourceMap>(fields: TFields): SharedPropertiesResult<TFields> {
      const state = ensurePropertiesState(options.state);

      writePropertySources(state, fields);

      return {
        fields,
        ref: createPropertyRefs(fields) as SharedPropertiesResult<TFields>['ref'],
      };
    },

    forRef<TFields extends PropertySourceMap>(fields: TFields): ForRefPropertiesResult<TFields> {
      const state = ensurePropertiesState(options.state);

      writePropertySources(state, fields);

      return {
        fields,
        ref: createPropertyRefs(fields) as ForRefPropertiesResult<TFields>['ref'],
      };
    },

    entity<TName extends string, TFields extends EntityFieldInputMap>(
      name: TName,
      fields: TFields,
      entityOptions: EntityOptions = {},
    ): EntityPropertiesResult<TName, TFields> {
      const fieldRefs = createEntityFieldRefs(name, fields);

      writeEntitySource(options.schemas, name, fields, entityOptions);

      return {
        name,
        fields,
        entity: entityRef(name),
        ref: {
          fields: fieldRefs as EntityPropertiesResult<TName, TFields>['ref']['fields'],
          models: modelRefs(name) as EntityPropertiesResult<TName, TFields>['ref']['models'],
        },
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
