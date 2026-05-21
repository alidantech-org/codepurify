import type { EngineRef } from "./ref.types.js";

export interface RefUsage<TRef extends EngineRef = EngineRef> {
  readonly ref: TRef;
  readonly required?: boolean;
  readonly nullable?: boolean;
}

export type RefWithUsageMethods<TRef extends EngineRef> = TRef & {
  optional(): RefUsage<TRef>;
  required(): RefUsage<TRef>;
  nullable(): RefUsage<TRef>;
  nonNullable(): RefUsage<TRef>;
};
