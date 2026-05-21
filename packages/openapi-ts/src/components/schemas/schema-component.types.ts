import type { ComponentFieldMap } from '../component.types.js';
import type { ComponentRef } from '../../refs/ref.types.js';
import type { SdkExtensionMeta } from '../../sdk/sdk-extension.types.js';

export interface SchemaComponentDefinition {
  readonly name: string;
  readonly fields: ComponentFieldMap;
  readonly meta?: SdkExtensionMeta;
}

export interface SchemaComponentRegistry<TRefs extends Record<string, ComponentRef> = Record<string, ComponentRef>> {
  readonly name: string;
  readonly definitions: SchemaComponentDefinition[];
  readonly ref: TRefs;
}
