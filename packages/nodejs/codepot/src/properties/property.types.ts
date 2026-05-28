import type { PropertyKind } from './property-kind.js';
import type { ModelRef, PropertyRef, ComponentRef } from '../refs/ref.types.js';
import type { RefUsage, RefWithUsageMethods } from '../refs/ref-usage.types.js';
import type { PropertyDefinitionFieldMap, SchemaField } from '../schema/schema.types.js';
import type { CodegenMetadata } from '../codegen/codegen-extension.types.js';
import type { DeepPartial, ModelEmissionInput, ModelEmissionOptions } from '../config/model-emission-defaults.js';
import type { QueryModelOptions } from '../config/query-model-defaults.js';

export interface EntityValueRefs {
  /**
   * Sort value enum ref.
   *
   * Emits:
   * {Entity}QuerySortValue
   *
   * Example values:
   * +createdAt
   * -createdAt
   * +name
   * -name
   */
  readonly querySort: RefWithUsageMethods<PropertyRef>;

  /**
   * Select value enum ref.
   *
   * Emits:
   * {Entity}QuerySelectValue
   */
  readonly querySelect: RefWithUsageMethods<PropertyRef>;
}

export type EntityFieldInput<TEntity> = Partial<Record<Extract<keyof TEntity, string>, SchemaField>>;

export type EntityLocalFields = Record<string, SchemaField>;

export type NoExtraEntityKeys<TEntity, TFields extends EntityLocalFields> = TEntity extends unknown
  ? TFields
  : Exclude<keyof TFields, Extract<keyof TEntity, string>> extends never
    ? TFields
    : never;

export type UnionToIntersection<TUnion> = (TUnion extends unknown ? (value: TUnion) => void : never) extends (
  value: infer TIntersection,
) => void
  ? TIntersection
  : never;

export type EntityFieldRefs<TFields extends Record<string, SchemaField>> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

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
  readonly meta?: CodegenMetadata;
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
  readonly refs?: EntityPropertyRefs;
}

export interface ForRefPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.forRef;
}

export type PropertyDefinition<TEntity = unknown> = SharedPropertyDefinition | EntityPropertyDefinition<TEntity> | ForRefPropertyDefinition;

export type PropertyRefGroup = Record<string, RefWithUsageMethods<PropertyRef> | RefUsage<PropertyRef>>;

export type PropertyFieldRefMap<TFields> = {
  readonly [Key in keyof TFields & string]: RefWithUsageMethods<PropertyRef>;
};

export type PropertyGroupRegistry<TRefs extends PropertyRefGroup = PropertyRefGroup> = Omit<PropertyRegistry, 'ref'> & {
  readonly ref: TRefs;
};

export interface EntityPropertyRefs<TFields extends PropertyRefGroup = PropertyRefGroup> {
  readonly name: string;

  /**
   * Final resolved field refs:
   * inherited base fields + own entity fields.
   */
  readonly fields: TFields;

  /**
   * Full default model.
   *
   * Emits:
   * {Entity}Model
   */
  readonly model: RefWithUsageMethods<ModelRef>;

  /**
   * Full public model.
   *
   * Emits:
   * {Entity}PublicModel
   */
  readonly publicModel: RefWithUsageMethods<ModelRef>;

  /**
   * Full internal model.
   *
   * Emits:
   * {Entity}InternalModel
   */
  readonly internalModel: RefWithUsageMethods<ModelRef>;

  /**
   * Partial default model.
   *
   * Emits:
   * {Entity}PartialModel
   */
  readonly partialModel: RefWithUsageMethods<ModelRef>;

  /**
   * Partial public model.
   *
   * Emits:
   * {Entity}PublicPartialModel
   */
  readonly publicPartialModel: RefWithUsageMethods<ModelRef>;

  /**
   * Partial internal model.
   *
   * Emits:
   * {Entity}InternalPartialModel
   */
  readonly internalPartialModel: RefWithUsageMethods<ModelRef>;

  /**
   * Basic field=value query filter model.
   *
   * Emits:
   * {Entity}QueryFilter
   */
  readonly queryFilterModel: RefWithUsageMethods<ModelRef>;

  /**
   * Advanced suffix query filter model (search/in/range/exists).
   *
   * Emits:
   * {Entity}AdvancedQueryFilter
   */
  readonly advancedQueryFilterModel: RefWithUsageMethods<ModelRef>;

  /**
   * Reusable enum/value refs.
   */
  readonly values: EntityValueRefs;

  readonly abstract?: boolean;
  readonly schemaRef?: string;

  readonly modelEmission: ModelEmissionOptions;
  readonly queryModelOptions: QueryModelOptions;
}

export type AnyEntityRegistryResult = EntityRegistryResult<string, Record<string, SchemaField>, Record<string, SchemaField>>;

export type EntityInheritanceInput = EntityPropertyRefs<PropertyRefGroup> | AnyEntityRegistryResult;

export type ExtractEntityFields<TValue> =
  TValue extends EntityRegistryResult<string, infer TFields, infer TInherited>
    ? TFields & TInherited
    : TValue extends EntityPropertyRefs
      ? Record<string, SchemaField>
      : {};

export type ExtractInheritedFields<TExtends> = TExtends extends readonly unknown[]
  ? UnionToIntersection<ExtractEntityFields<TExtends[number]>>
  : ExtractEntityFields<TExtends>;

export interface EntityRegistryResult<
  TName extends string,
  TFields extends Record<string, SchemaField>,
  TInheritedFields extends Record<string, SchemaField> = {},
> extends Omit<PropertyRegistry, 'ref'> {
  readonly ref: EntityPropertyRefs<EntityFieldRefs<TFields & TInheritedFields>>;
  readonly namedRef: Record<TName, EntityPropertyRefs<EntityFieldRefs<TFields & TInheritedFields>>>;
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

export interface EntityOptions<TExtends extends EntityInheritanceInput | readonly EntityInheritanceInput[] | undefined = undefined> {
  readonly extends?: TExtends;
  readonly abstract?: boolean;
  readonly emitModels?: ModelEmissionInput;
  readonly queryModels?: DeepPartial<QueryModelOptions>;
}

export type AnyNamedEntityRegistry = NamedEntityPropertyRegistry<string, PropertyRefGroup>;

export type NormalizeInheritanceInput<T> = T extends readonly unknown[] ? T[number] : T;

export type InheritedFields<T> =
  NormalizeInheritanceInput<T> extends RefWithUsageMethods<ComponentRef> ? {} : NormalizeInheritanceInput<T> extends ComponentRef ? {} : {};

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
