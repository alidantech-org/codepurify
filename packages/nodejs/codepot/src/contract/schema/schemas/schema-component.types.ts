import { CodegenMetadata } from '@/pipeline/targets/codegen/codegen-extension.types';
import type { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types';
import { RefUsage, RefWithUsageMethods } from '@/contract/refs/ref-usage.types';
import { EngineRef, ComponentRef } from '@/contract/refs/ref.types';

export type SchemaComponentValue = ComponentFieldMap | EngineRef | RefUsage<EngineRef> | RefUsage<ComponentRef>;

export interface SchemaComponentDefinition {
  readonly name: string;
  readonly value: SchemaComponentValue;
  readonly meta?: CodegenMetadata;
}

export type SchemaComponentRefs<TInput extends Record<string, SchemaComponentValue>> = {
  readonly [Key in keyof TInput & string]: RefWithUsageMethods<ComponentRef>;
};

export interface SchemaComponentRegistry<TInput extends Record<string, SchemaComponentValue> = Record<string, SchemaComponentValue>> {
  readonly name: string;
  readonly definitions: SchemaComponentDefinition[];
  readonly ref: SchemaComponentRefs<TInput>;
}
