import type {
  ComponentRef,
  EngineRef,
  PropertyRef,
} from "../refs/ref.types.js";
import type { RefUsage } from "../refs/ref-usage.types.js";
import type { SdkExtensionMeta } from "../sdk/sdk-extension.types.js";

export type ComponentFieldValue =
  | PropertyRef
  | ComponentRef
  | RefUsage<EngineRef>
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
