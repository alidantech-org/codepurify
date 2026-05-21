import type { ComponentFieldMap } from '../component.types.js';
import type { ComponentRef, ModelRef, ResponseRef } from '../../refs/ref.types.js';
import type { EngineRef } from '../../refs/ref.types.js';
import type { RefUsage } from '../../refs/ref-usage.types.js';
import type { SdkExtensionMeta } from '../../sdk/sdk-extension.types.js';

export type ResponseSchemaRef = ComponentRef | ModelRef | ComponentFieldMap | RefUsage<EngineRef>;

export interface ResponseComponentDefinition {
  readonly name: string;
  readonly description: string;
  readonly schema?: ResponseSchemaRef;
  readonly meta?: SdkExtensionMeta;
}

export interface ResponseComponentRegistry<TRefs extends Record<string, ResponseRef> = Record<string, ResponseRef>> {
  readonly name: string;
  readonly definitions: ResponseComponentDefinition[];
  readonly ref: TRefs;
}
