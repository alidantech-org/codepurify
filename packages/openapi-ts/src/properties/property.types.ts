import type { PropertyKind } from "./property-kind";
import type { PropertyRef, ModelRef } from "../refs/ref.types.js";
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

export type PropertyRefGroup = Record<string, PropertyRef>;

export interface EntityPropertyRefs {
  readonly fields: PropertyRefGroup;
  readonly model: ModelRef;
  readonly publicModel: ModelRef;
  readonly partialModel: ModelRef;
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
