import type { z } from 'zod';

import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { OptionalResourceContext } from '../resource/resource-context.types.js';
import type { PropertyDefinitionFieldMap, SchemaField } from '../schema/schema.types.js';
import { compileZodRef } from '../zod/compile-zod-ref.js';

import { createEntityRefs } from './entity-ref.factory.js';
import { mergeInheritedFields, normalizeExtends } from './entity-inheritance.js';
import { createPropertyRefs } from './property-ref.factory.js';
import { PropertyKind } from './property-kind.js';
import type {
  EntityInheritanceInput,
  EntityLocalFields,
  EntityOptions,
  EntityPropertyRefs,
  EntityRegistryResult,
  ExtractInheritedFields,
  NoExtraEntityKeys,
  PropertyDefinition,
  PropertyFieldRefMap,
  PropertyGroupOptions,
  PropertyGroupRegistry,
  PropertyRegistry,
} from './property.types.js';

import type { DeepPartial, ModelEmissionInput } from '../config/model-emission-defaults.js';
import type { QueryModelOptions } from '../config/query-model-defaults.js';

export interface DefinePropertiesOptions extends OptionalResourceContext {
  readonly name: string;
  readonly modelEmission?: ModelEmissionInput;
  readonly queryModels?: DeepPartial<QueryModelOptions>;
}

/**
 * Public property registry facade.
 *
 * This file only wires the public DSL:
 * - shared(...)
 * - forRef(...)
 * - entity(...)
 * - entityFor(...)
 *
 * The implementation details live in focused factory/helper modules.
 */
export function defineProperties(options: DefinePropertiesOptions) {
  const definitions: PropertyDefinition[] = [];
  const refs: PropertyRegistry['ref'] = {};

  const toZod = options.zodRegistry
    ? (ref: unknown): z.ZodTypeAny => compileZodRef(ref as PropertyRef | ModelRef, options.zodRegistry!)
    : undefined;

  function shared<TName extends string, TFields extends PropertyDefinitionFieldMap>(
    name: TName,
    fields: TFields,
    groupOptions: PropertyGroupOptions = {},
  ): PropertyGroupRegistry<PropertyFieldRefMap<TFields>> {
    definitions.push({
      kind: PropertyKind.shared,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });

    const groupRefs = createPropertyRefs(options, name, fields, PropertyKind.shared, toZod) as PropertyFieldRefMap<TFields>;

    refs[name] = groupRefs;

    return {
      name: options.name,
      definitions,
      ref: groupRefs,
    } as PropertyGroupRegistry<PropertyFieldRefMap<TFields>>;
  }

  function forRef<TName extends string, TFields extends PropertyDefinitionFieldMap>(
    name: TName,
    fields: TFields,
    groupOptions: PropertyGroupOptions = {},
  ): PropertyGroupRegistry<PropertyFieldRefMap<TFields>> {
    definitions.push({
      kind: PropertyKind.forRef,
      name,
      fields,
      emitSchema: groupOptions.emitSchema,
      abstract: groupOptions.abstract,
    });

    const groupRefs = createPropertyRefs(options, name, fields, PropertyKind.forRef, toZod) as PropertyFieldRefMap<TFields>;

    refs[name] = groupRefs;

    return {
      name: options.name,
      definitions,
      ref: groupRefs,
    } as PropertyGroupRegistry<PropertyFieldRefMap<TFields>>;
  }

  function entity<
    const TName extends string = string,
    const TFields extends EntityLocalFields = EntityLocalFields,
    TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
  >(
    name: TName,
    fields: TFields,
    entityOptions: EntityOptions<TExtends> = {},
  ): EntityRegistryResult<TName, TFields, Record<string, SchemaField>> {
    return createEntityRegistry(name, fields, entityOptions);
  }

  function entityFor<TEntity>() {
    return <
      const TName extends string = string,
      const TFields extends EntityLocalFields = EntityLocalFields,
      TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
    >(
      name: TName,
      fields: NoExtraEntityKeys<TEntity, TFields>,
      entityOptions: EntityOptions<TExtends> = {},
    ): EntityRegistryResult<TName, TFields, Record<string, SchemaField>> => {
      return createEntityRegistry(name, fields, entityOptions);
    };
  }

  function createEntityRegistry<
    const TName extends string = string,
    const TFields extends EntityLocalFields = EntityLocalFields,
    TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined,
  >(
    name: TName,
    fields: TFields,
    entityOptions: EntityOptions<TExtends>,
  ): EntityRegistryResult<TName, TFields, Record<string, SchemaField>> {
    const inheritedRefs = normalizeExtends(entityOptions.extends);
    const mergedFields = mergeInheritedFields(entityOptions.extends, fields as Record<string, SchemaField>) as TFields &
      ExtractInheritedFields<TExtends>;

    const entityRefs = createEntityRefs(
      options,
      name,
      mergedFields as Record<string, SchemaField>,
      inheritedRefs,
      entityOptions.abstract === true,
      toZod,
      // entityOptions,
    );

    definitions.push({
      kind: PropertyKind.entity,
      name,
      fields: mergedFields,
      extends: entityOptions.extends ? (inheritedRefs as never) : undefined,
      abstract: entityOptions.abstract,
      refs: entityRefs,
    });

    refs[name] = entityRefs as unknown as EntityPropertyRefs;

    return {
      ...registry(),
      ref: entityRefs as EntityPropertyRefs<PropertyFieldRefMap<TFields>>,
      namedRef: {
        [name]: entityRefs,
      } as Record<TName, EntityPropertyRefs<PropertyFieldRefMap<TFields>>>,
    };
  }

  function registry(): PropertyRegistry {
    return {
      name: options.name,
      definitions,
      ref: refs,
    };
  }

  return {
    shared,
    entity,
    entityFor,
    forRef,
    registry,
  };
}
