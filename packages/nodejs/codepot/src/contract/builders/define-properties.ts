// src/contract/builders/define-properties.ts

import type { PropertiesDefinition, RefProperty } from '@/contract/types/properties/definition';
import type { PrimitiveDefinition } from '@/contract/types/properties/primitive/definition';
import type { EnumDefinition } from '@/contract/types/properties/enum/definition';
import type { CompositeDefinition } from '@/contract/types/properties/composite/definition';
import type { EntityDefinition } from '@/contract/types/schema/entity/definition';
import type { EntityField } from '@/contract/types/schema/entity/field/definition';
import type { Ref } from '@/contract/types/ref';

import {
  AuthoringRefKind,
  type EntityAuthoringRef,
  type EntityFieldAuthoringRef,
  type ModelAuthoringRef,
  type PropertyAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import type {
  EntityFieldInput,
  EntityFieldInputMap,
  EntityModelRefs,
  EntityOptions,
  EntityPropertiesResult,
  EnumPropertySourceInput,
  ForRefPropertiesResult,
  PropertiesBuilder,
  PropertySourceInput,
  PropertySourceMap,
  SharedPropertiesResult,
} from '@/contract/types/core/4.properties-builder';

import { ModelCategory } from '@/contract/types/schema/model/definition';
import { createAuthoringRef, createExtendableAuthoringRef, refPath } from '@/contract/helpers/refs/create-authoring-ref';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefinePropertiesOptions {
  readonly scope: 'version' | 'resource';
  readonly resourceKey?: string;
  readonly state: Partial<PropertiesDefinition>;
}

// ============================================================================
// PATHS
// ============================================================================

function propertyBasePath(options: DefinePropertiesOptions): string {
  if (options.scope === 'resource' && options.resourceKey) {
    return `#/resources/${options.resourceKey}/properties`;
  }

  return '#/properties';
}

function entityBasePath(options: DefinePropertiesOptions): string {
  if (options.scope === 'resource' && options.resourceKey) {
    return `#/resources/${options.resourceKey}/schemas/entities`;
  }

  return '#/schemas/entities';
}

function modelBasePath(options: DefinePropertiesOptions): string {
  if (options.scope === 'resource' && options.resourceKey) {
    return `#/resources/${options.resourceKey}/schemas/models`;
  }

  return '#/schemas/models';
}

function propertyPath(options: DefinePropertiesOptions, key: string): Ref<RefProperty> {
  return refPath<RefProperty>(`${propertyBasePath(options)}/${key}`);
}

function entityPath(options: DefinePropertiesOptions, name: string): Ref<EntityDefinition> {
  return refPath<EntityDefinition>(`${entityBasePath(options)}/${name}`);
}

function entityFieldPath(options: DefinePropertiesOptions, entityName: string, fieldKey: string): Ref<EntityField> {
  return refPath<EntityField>(`${entityBasePath(options)}/${entityName}/fields/${fieldKey}`);
}

function modelPath(options: DefinePropertiesOptions, entityName: string, category: ModelCategory): Ref<never> {
  return refPath<never>(`${modelBasePath(options)}/${entityName}/${category}`);
}

// ============================================================================
// REFS
// ============================================================================

function createPropertyRef(options: DefinePropertiesOptions, key: string): PropertyAuthoringRef {
  return createAuthoringRef({
    path: propertyPath(options, key) as Ref<PrimitiveDefinition | EnumDefinition | CompositeDefinition>,
    kind: AuthoringRefKind.propertyPrimitive,
    key,
    name: key,
  }) as PropertyAuthoringRef;
}

function createEntityRef(options: DefinePropertiesOptions, name: string): EntityAuthoringRef {
  return createAuthoringRef({
    path: entityPath(options, name),
    kind: AuthoringRefKind.schemaEntity,
    key: name,
    name,
  });
}

function createEntityFieldRef(options: DefinePropertiesOptions, entityName: string, fieldKey: string): EntityFieldAuthoringRef {
  return createAuthoringRef({
    path: entityFieldPath(options, entityName, fieldKey),
    kind: AuthoringRefKind.schemaEntityField,
    key: fieldKey,
    name: fieldKey,
  });
}

function createModelRef(options: DefinePropertiesOptions, entityName: string, category: ModelCategory): ModelAuthoringRef {
  return createExtendableAuthoringRef({
    path: modelPath(options, entityName, category),
    kind: AuthoringRefKind.schemaModel,
    key: category,
    name: `${entityName}.${category}`,
  }) as ModelAuthoringRef;
}

function createModelRefs(options: DefinePropertiesOptions, entityName: string): EntityModelRefs {
  return {
    read: createModelRef(options, entityName, ModelCategory.read),
    create: createModelRef(options, entityName, ModelCategory.create),
    patch: createModelRef(options, entityName, ModelCategory.patch),
    query: createModelRef(options, entityName, ModelCategory.query),
    projection: createModelRef(options, entityName, ModelCategory.projection),
    redacted: createModelRef(options, entityName, ModelCategory.redacted),
    derived: createModelRef(options, entityName, ModelCategory.derived),
    internal: createModelRef(options, entityName, ModelCategory.internal),
  };
}

// ============================================================================
// STATE WRITES
// ============================================================================

function ensureState(state: Partial<PropertiesDefinition>): PropertiesDefinition {
  state.primitives ??= {};
  state.enums ??= {};
  state.composites ??= {};

  return state as PropertiesDefinition;
}

function writePropertySource(options: DefinePropertiesOptions, key: string, source: PropertySourceInput): void {
  const state = ensureState(options.state);

  if (source.kind === 'primitive') {
    state.primitives[key] = {
      type: source.type,
      format: source.format,
      example: source.example,
      validation: source.validation,
      description: source.description,
      deprecated: source.deprecated,
      meta: source.meta,
    };
    return;
  }

  if (source.kind === 'enum') {
    state.enums[key] = {
      values: normalizeEnumValues(source.values),
      description: source.description,
      deprecated: source.deprecated,
      meta: source.meta,
    };
    return;
  }

  if (source.kind === 'composite') {
    state.composites[key] = {
      extends: source.extends?.path as Ref<CompositeDefinition> | undefined,
      properties: Object.fromEntries(
        Object.entries(source.properties).map(([fieldKey, value]) => [fieldKey, sourceToPropertyRef(options, `${key}_${fieldKey}`, value)]),
      ),
      description: source.description,
      deprecated: source.deprecated,
      meta: source.meta,
    };
  }
}

function sourceToPropertyRef(options: DefinePropertiesOptions, key: string, source: PropertySourceInput): Ref<RefProperty> {
  if (source.kind === 'ref') {
    return source.ref.path as Ref<RefProperty>;
  }

  writePropertySource(options, key, source);
  return propertyPath(options, key);
}

function normalizeEnumValues(
  values: PropertySourceInput extends infer _T ? EnumPropertySourceInput['values'] : never,
): EnumDefinition['values'] {
  if (Array.isArray(values)) {
    return Object.fromEntries(
      values.map((value) => [
        String(value),
        {
          value,
          label: String(value),
        },
      ]),
    );
  }

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'value' in value) {
        return [
          key,
          {
            value: value.value,
            label: value.label ?? key,
            description: value.description,
            deprecated: value.deprecated,
            meta: value.meta,
          },
        ];
      }

      return [
        key,
        {
          value,
          label: key,
        },
      ];
    }),
  );
}

function toEntityField(options: DefinePropertiesOptions, entityName: string, key: string, input: EntityFieldInput): EntityField {
  return {
    type: {
      ref: sourceToPropertyRef(options, `${entityName}_${key}`, input.source),
      array: input.options?.array,
      description: input.options?.description,
      deprecated: input.options?.deprecated,
      meta: input.options?.meta,
    },
    required: input.options?.required,
    nullable: input.options?.nullable,
    default: input.options?.default,
    query: input.options?.query,
    access: input.options?.access,
    persistence: input.options?.persistence,
    description: input.options?.description,
    deprecated: input.options?.deprecated,
    meta: input.options?.meta,
  };
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
      const refs = {} as Record<keyof TFields & string, PropertyAuthoringRef>;

      for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
        writePropertySource(options, key, value);
        refs[key] = createPropertyRef(options, key);
      }

      return {
        fields,
        ref: refs as SharedPropertiesResult<TFields>['ref'],
      };
    },

    forRef<TFields extends PropertySourceMap>(fields: TFields): ForRefPropertiesResult<TFields> {
      const refs = {} as Record<keyof TFields & string, PropertyAuthoringRef>;

      for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
        writePropertySource(options, key, value);
        refs[key] = createPropertyRef(options, key);
      }

      return {
        fields,
        ref: refs as ForRefPropertiesResult<TFields>['ref'],
      };
    },

    entity<TName extends string, TFields extends EntityFieldInputMap>(
      name: TName,
      fields: TFields,
      entityOptions: EntityOptions = {},
    ): EntityPropertiesResult<TName, TFields> {
      const fieldRefs = {} as Record<keyof TFields & string, EntityFieldAuthoringRef>;

      for (const [key, value] of Object.entries(fields) as [keyof TFields & string, TFields[keyof TFields & string]][]) {
        fieldRefs[key] = createEntityFieldRef(options, name, key);
        toEntityField(options, name, key, value);
      }

      return {
        name,
        fields,
        entity: createEntityRef(options, name),
        ref: {
          fields: fieldRefs as EntityPropertiesResult<TName, TFields>['ref']['fields'],
          models: createModelRefs(options, name),
        },
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
