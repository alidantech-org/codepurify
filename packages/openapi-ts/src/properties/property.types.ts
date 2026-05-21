import type { PropertyKind } from "./property-kind.js";
import type { ModelRef, PropertyRef } from "../refs/ref.types.js";
import type { RefWithUsageMethods } from "../refs/ref-usage.types.js";
import type { SchemaFieldMap } from "../schema/schema.types.js";
import type { SdkExtensionMeta } from "../sdk/sdk-extension.types.js";

export type EntityFields<TEntity> = {
  [Key in keyof TEntity]?: SchemaFieldMap[string];
};

export interface PropertyDefinitionBase {
  readonly name: string;
  readonly fields: SchemaFieldMap;
  readonly meta?: SdkExtensionMeta;
}

export interface SharedPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.shared;
}

export interface EntityPropertyDefinition<TEntity> extends Omit<
  PropertyDefinitionBase,
  "fields"
> {
  readonly kind: typeof PropertyKind.entity;
  readonly fields: EntityFields<TEntity>;
}

export interface ForRefPropertyDefinition extends PropertyDefinitionBase {
  readonly kind: typeof PropertyKind.forRef;
}

export type PropertyDefinition<TEntity = unknown> =
  | SharedPropertyDefinition
  | EntityPropertyDefinition<TEntity>
  | ForRefPropertyDefinition;

export type PropertyRefGroup = Record<string, RefWithUsageMethods<PropertyRef>>;

export interface EntityQueryRefs {
  readonly exact?: ModelRef;
  readonly search?: ModelRef;
  readonly exactSearch?: ModelRef;
  readonly range?: ModelRef;
  readonly in?: ModelRef;
  readonly exists?: ModelRef;
  readonly sort?: ModelRef;
}

export interface EntityPropertyRefs {
  readonly fields: PropertyRefGroup;
  readonly model: ModelRef;
  readonly publicModel: ModelRef;
  readonly selectedModel: ModelRef;
  readonly partialModel: ModelRef;
  readonly query: EntityQueryRefs;
}

export type PropertyRegistryRef =
  | PropertyRef
  | PropertyRefGroup
  | EntityPropertyRefs;

export interface PropertyRegistry {
  readonly name: string;
  readonly definitions: PropertyDefinition[];
  readonly ref: Record<string, PropertyRegistryRef>;
}

export type NamedEntityPropertyRegistry<TName extends string> = Omit<
  PropertyRegistry,
  "ref"
> & {
  readonly ref: Record<TName, EntityPropertyRefs>;
};

export type NamedPropertyRefRegistry<TName extends string> = Omit<
  PropertyRegistry,
  "ref"
> & {
  readonly ref: Record<TName, PropertyRefGroup>;
};
