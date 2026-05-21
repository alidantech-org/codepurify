import type { ComponentRef, PropertyRef } from "../refs/ref.types.js";
import type { SdkExtensionMeta } from "../sdk/sdk-extension.types.js";

export type ComponentFieldValue =
  | PropertyRef
  | ComponentRef
  | ComponentFieldMap;

export type ComponentFieldMap = {
  readonly [key: string]: ComponentFieldValue;
};

export interface ComponentDefinition {
  readonly name: string;
  readonly fields: ComponentFieldMap;
  readonly meta?: SdkExtensionMeta;
}

export interface ComponentRegistry {
  readonly name: string;
  readonly definitions: ComponentDefinition[];
  readonly ref: Record<string, ComponentRef>;
}
