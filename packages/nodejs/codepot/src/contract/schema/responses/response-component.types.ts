import type { ComponentRef, ModelRef, ResponseRef } from '../../refs/ref.types';
import type { EngineRef } from '../../refs/ref.types';
import type { RefUsage } from '../../refs/ref-usage.types';
import { CodegenMetadata } from '@/pipeline/targets/codegen/codegen-extension.types';
import { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types';

export type ResponseSchemaRef = ComponentRef | ModelRef | ComponentFieldMap | RefUsage<EngineRef>;

export interface ResponseComponentDefinition {
  readonly name: string;
  readonly description: string;
  readonly schema?: ResponseSchemaRef;
  readonly meta?: CodegenMetadata;
}

export interface ResponseComponentRegistry<TRefs extends Record<string, ResponseRef> = Record<string, ResponseRef>> {
  readonly name: string;
  readonly definitions: ResponseComponentDefinition[];
  readonly ref: TRefs;
}
