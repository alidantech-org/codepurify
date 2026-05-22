import type { ComponentRef, EngineRef, ModelRef, PropertyRef } from './ref.types.js';
import type { SchemaCompositionFieldMap } from '../schema/schema.types.js';

export type ExtendWithFieldMap = SchemaCompositionFieldMap;

export interface RefUsageOptions {
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly array?: boolean;
  readonly extendWith?: ExtendWithFieldMap;
}

export interface RefUsage<TRef extends EngineRef = EngineRef> {
  readonly ref: TRef;
  readonly usage: RefUsageOptions;
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
  array(): RefUsage<TRef>;
  extendWith(fields: ExtendWithFieldMap): RefUsage<TRef>;
}

export type RefWithUsageMethods<TRef extends EngineRef> = TRef & {
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
  array(): RefUsage<TRef>;
  extendWith(fields: ExtendWithFieldMap): RefUsage<TRef>;
};
