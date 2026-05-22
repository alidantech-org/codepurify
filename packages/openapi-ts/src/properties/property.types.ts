import type { PropertyKind } from './property-kind.js';
import type { ModelRef, PropertyRef, ComponentRef } from '../refs/ref.types.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { PropertyDefinitionFieldMap, SchemaFieldMap } from '../schema/schema.types.js';
import type { SdkExtensionMeta } from '../sdk/sdk-extension.types.js';

export type EntityFields<TEntity> = {
  [Key in keyof TEntity]?: PropertyDefinitionFieldMap[string];
};

export interface PropertyGroupOptions {
  readonly emitSchema?: boolean;
  readonly abstract?: boolean;
}

export interface PropertyDefinitionBase {
  readonly name: string;
  readonly fields: PropertyDefinitionFieldMap;
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
  readonly extends?: readonly NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>[];
}

export interface ForRefPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.forRef;
}

export type PropertyDefinition<TEntity = unknown> = SharedPropertyDefinition | EntityPropertyDefinition<TEntity> | ForRefPropertyDefinition;

export type PropertyRefGroup = Record<string, RefWithUsageMethods<PropertyRef>>;

export type PropertyFieldRefMap<TFields> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type PropertyGroupRegistry<TRefs extends PropertyRefGroup = PropertyRefGroup> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: TRefs;
};

export interface EntityQueryRefs {
  readonly exact: RefWithUsageMethods<ModelRef>;
  readonly search: RefWithUsageMethods<ModelRef>;
  readonly exactSearch: RefWithUsageMethods<ModelRef>;
  readonly range: RefWithUsageMethods<ModelRef>;
  readonly in: RefWithUsageMethods<ModelRef>;
  readonly exists: RefWithUsageMethods<ModelRef>;
  readonly sort: RefWithUsageMethods<ModelRef>;
}

export interface EntityPropertyRefs<TFields extends PropertyRefGroup = PropertyRefGroup> {
  readonly name: string;
  readonly fields: TFields;
  readonly model: RefWithUsageMethods<ModelRef>;
  readonly publicModel: RefWithUsageMethods<ModelRef>;
  readonly selectedModel: RefWithUsageMethods<ModelRef>;
  readonly partialModel: RefWithUsageMethods<ModelRef>;
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

export type EntityPropertyRegistry<TFields extends PropertyRefGroup = PropertyRefGroup> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: EntityPropertyRefs<TFields>;
};

export type EntityExtensionMap = Record<string, EntityExtensionValue>;

export interface EntityExtensionValue {
  readonly name: string;
  readonly ref: EntityPropertyRefs<PropertyRefGroup>;
}

export type NamedEntityPropertyRegistry<
  TName extends string,
  TFields extends PropertyRefGroup = PropertyRefGroup,
  TExtends extends EntityExtensionMap = {},
> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: EntityPropertyRefs<TFields>;
  readonly fields: PropertyDefinitionFieldMap;
  readonly sourceFields: PropertyDefinitionFieldMap;
  readonly inheritedFields: PropertyDefinitionFieldMap;
  readonly allFields: PropertyDefinitionFieldMap;
  readonly extends: TExtends;
  readonly abstract?: boolean;
};

export type NamedPropertyRefRegistry<TName extends string> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: Record<TName, PropertyRefGroup>;
};

export interface EntityOptions<
  TBaseEntity extends NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap> | undefined = undefined,
> {
  readonly extends?: TBaseEntity;
  readonly abstract?: boolean;
}

export type AnyNamedEntityRegistry = NamedEntityPropertyRegistry<string, PropertyRefGroup>;

export type EntityInheritanceInput =
  | ComponentRef
  | RefWithUsageMethods<ComponentRef>
  | ModelRef
  | RefWithUsageMethods<ModelRef>
  | readonly (ComponentRef | RefWithUsageMethods<ComponentRef> | ModelRef | RefWithUsageMethods<ModelRef>)[];

export type NormalizeInheritanceInput<T> = T extends readonly unknown[] ? T[number] : T;

export type InheritedFields<T> =
  NormalizeInheritanceInput<T> extends RefWithUsageMethods<ComponentRef> ? {} : NormalizeInheritanceInput<T> extends ComponentRef ? {} : {};

export type EntityFieldRefs<TEntity, TFields extends EntityFields<TEntity>> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type MergedEntityFieldRefs<TInherited, TOwn extends PropertyRefGroup> = InheritedFields<TInherited> & TOwn;

export type MergePropertyRefGroups<TBase extends PropertyRefGroup, TLocal extends PropertyRefGroup> = Omit<TBase, keyof TLocal> & TLocal;

export type EntityRegistryName<TEntity> =
  TEntity extends NamedEntityPropertyRegistry<infer TName, PropertyRefGroup, EntityExtensionMap> ? TName : never;

export type EntityRegistryFields<TEntity> =
  TEntity extends NamedEntityPropertyRegistry<string, infer TFields, EntityExtensionMap> ? TFields : never;

export type EntityRegistryExtensionEntry<TEntity> =
  TEntity extends NamedEntityPropertyRegistry<infer TName, infer TFields, infer TExtends>
    ? Record<TName, NamedEntityPropertyRegistry<TName, TFields, TExtends>>
    : never;

export type PropertyRefsFromFields<TFields extends PropertyDefinitionFieldMap> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type EntityRegistryBase = NamedEntityPropertyRegistry<string, PropertyRefGroup, EntityExtensionMap>;

export type MaybeEntityRegistry = EntityRegistryBase | undefined;

export type EntityFieldsOf<TEntity extends MaybeEntityRegistry> =
  TEntity extends NamedEntityPropertyRegistry<string, infer TFields, EntityExtensionMap> ? TFields : {};

export type EntityExtendsOf<TEntity extends MaybeEntityRegistry> =
  TEntity extends NamedEntityPropertyRegistry<string, PropertyRefGroup, infer TExtends> ? TExtends : {};

export type EntityExtensionEntry<TEntity extends EntityRegistryBase> =
  TEntity extends NamedEntityPropertyRegistry<infer TName, infer TFields, infer TExtends>
    ? Record<TName, NamedEntityPropertyRegistry<TName, TFields, TExtends>>
    : never;

export type EntityExtensionMapFor<TEntity extends MaybeEntityRegistry> = TEntity extends EntityRegistryBase
  ? EntityExtendsOf<TEntity> & EntityExtensionEntry<TEntity>
  : {};
