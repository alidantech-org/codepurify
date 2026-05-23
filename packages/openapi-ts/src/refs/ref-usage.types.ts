import type { z } from 'zod';
import type { ComponentRef, EngineRef, ModelRef, PropertyRef } from './ref.types.js';
import type { SchemaCompositionFieldMap } from '../schema/schema.types.js';
import type { ComponentFieldMap } from '../components/component.types.js';

export type ExtendWithInput = SchemaCompositionFieldMap | ModelRef | RefUsage<ModelRef>;

export interface RefUsageOptions {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly array?: boolean;
  readonly extendWith?: ExtendWithInput;
}

export interface RefUsage<TRef extends EngineRef = EngineRef> {
  readonly ref: TRef;
  readonly usage: RefUsageOptions;
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
  array(): RefUsage<TRef>;
  extendWith(fields: ExtendWithInput): RefUsage<TRef>;
  zod(): z.ZodTypeAny;
}

export type RefWithUsageMethods<TRef extends EngineRef> = TRef & {
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
  array(): RefUsage<TRef>;
  extendWith(fields: ExtendWithInput): RefUsage<TRef>;
  zod(): z.ZodTypeAny;
};
