import type { PropertyKind } from './property-kind.js';
import type { ModelRef, PropertyRef } from '../refs/ref.types.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { SchemaFieldMap } from '../schema/schema.types.js';
import type { SdkExtensionMeta } from '../sdk/sdk-extension.types.js';

export type EntityFields<TEntity> = {
  [Key in keyof TEntity]?: SchemaFieldMap[string];
};

export interface PropertyGroupOptions {
  readonly emitSchema?: boolean;
  readonly abstract?: boolean;
}

export interface PropertyDefinitionBase {
  readonly name: string;
  readonly fields: SchemaFieldMap;
  readonly meta?: SdkExtensionMeta;
  readonly emitSchema?: boolean;
  readonly abstract?: boolean;
}

export interface SharedPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.shared;
}

export interface EntityPropertyDefinition<TEntity> extends Omit<PropertyDefinitionBase, 'fields'> {
  readonly kind: typeof PropertyKind.entity;
  readonly fields: EntityFields<TEntity>;
  readonly extends?: readonly EntityInheritanceInput[];
}

export interface ForRefPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.forRef;
}

export type PropertyDefinition<TEntity = unknown> = SharedPropertyDefinition | EntityPropertyDefinition<TEntity> | ForRefPropertyDefinition;

export type PropertyRefGroup = Record<string, RefWithUsageMethods<PropertyRef>>;

export interface EntityQueryRefs {
  readonly exact: ModelRef;
  readonly search: ModelRef;
  readonly exactSearch: ModelRef;
  readonly range: ModelRef;
  readonly in: ModelRef;
  readonly exists: ModelRef;
  readonly sort: ModelRef;
}

export interface EntityPropertyRefs<TFields extends PropertyRefGroup = PropertyRefGroup> {
  readonly name: string;
  readonly fields: TFields;
  readonly model: ModelRef;
  readonly publicModel: ModelRef;
  readonly selectedModel: ModelRef;
  readonly partialModel: ModelRef;
  readonly query: EntityQueryRefs;
  readonly abstract?: boolean;
  readonly schemaRef?: string;
}

export type PropertyRegistryRef = PropertyRef | PropertyRefGroup | EntityPropertyRefs;

export interface PropertyRegistry {
  readonly name: string;
  readonly definitions: PropertyDefinition[];
  readonly ref: Record<string, PropertyRegistryRef>;
}

export type NamedEntityPropertyRegistry<TName extends string, TFields extends PropertyRefGroup = PropertyRefGroup> = Omit<
  PropertyRegistry,
  'ref'
> & {
  readonly ref: Record<TName, EntityPropertyRefs<TFields>>;
};

export type NamedPropertyRefRegistry<TName extends string> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: Record<TName, PropertyRefGroup>;
};

export interface EntityOptions<TExtends = EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined> {
  readonly extends?: TExtends;
  readonly abstract?: boolean;
}

export type AnyNamedEntityRegistry = NamedEntityPropertyRegistry<string, PropertyRefGroup>;

export type EntityRegistryFields<T> = T extends NamedEntityPropertyRegistry<string, infer TFields> ? TFields : never;

export type EntityInheritanceInput = EntityPropertyRefs | PropertyRefGroup;

export type NormalizeInheritanceInput<T> = T extends readonly unknown[] ? T[number] : T;

export type InheritedFields<T> =
  NormalizeInheritanceInput<T> extends EntityPropertyRefs<infer TFields>
    ? TFields
    : NormalizeInheritanceInput<T> extends PropertyRefGroup
      ? NormalizeInheritanceInput<T>
      : {};

export type EntityFieldRefs<TEntity, TFields extends EntityFields<TEntity>> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type MergedEntityFieldRefs<TInherited, TOwn extends PropertyRefGroup> = InheritedFields<TInherited> & TOwn;
