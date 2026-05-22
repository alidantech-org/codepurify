import type { ComponentFieldMap } from '../component.types.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import type { RefWithUsageMethods } from '../../refs/ref-usage.types.js';
import type { SdkExtensionMeta } from '../../sdk/sdk-extension.types.js';

export interface SchemaComponentDefinition {
  readonly name: string;
  readonly fields: ComponentFieldMap;
  readonly meta?: SdkExtensionMeta;
}

export type SchemaComponentRefs<TInput extends Record<string, ComponentFieldMap>> = {
  readonly [Key in keyof TInput & string]: RefWithUsageMethods<ComponentRef>;
};

export interface SchemaComponentRegistry<TInput extends Record<string, ComponentFieldMap> = Record<string, ComponentFieldMap>> {
  readonly name: string;
  readonly definitions: SchemaComponentDefinition[];
  readonly ref: SchemaComponentRefs<TInput>;
}
