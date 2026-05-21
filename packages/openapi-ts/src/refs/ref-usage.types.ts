import type { EngineRef } from './ref.types.js';

export interface RefUsageOptions {
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export interface RefUsage<TRef extends EngineRef = EngineRef> {
  readonly ref: TRef;
  readonly usage: RefUsageOptions;
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
}

export type RefWithUsageMethods<TRef extends EngineRef> = TRef & {
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
};
