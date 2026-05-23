import type { ComponentFieldMap } from '../component.types.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import type { EngineRef } from '../../refs/ref.types.js';
import type { RefWithUsageMethods } from '../../refs/ref-usage.types.js';
import type { RefUsage } from '../../refs/ref-usage.types.js';
import type { SdkExtensionMeta } from '../../sdk/sdk-extension.types.js';

export type SchemaComponentValue = ComponentFieldMap | EngineRef | RefUsage<EngineRef> | RefUsage<ComponentRef>;

export interface SchemaComponentDefinition {
  readonly name: string;
  readonly value: SchemaComponentValue;
  readonly meta?: SdkExtensionMeta;
}

export type SchemaComponentRefs<TInput extends Record<string, SchemaComponentValue>> = {
  readonly [Key in keyof TInput & string]: RefWithUsageMethods<ComponentRef>;
};

export interface SchemaComponentRegistry<TInput extends Record<string, SchemaComponentValue> = Record<string, SchemaComponentValue>> {
  readonly name: string;
  readonly definitions: SchemaComponentDefinition[];
  readonly ref: SchemaComponentRefs<TInput>;
}
