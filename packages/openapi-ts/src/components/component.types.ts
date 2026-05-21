import type { ComponentRef, PropertyRef } from '../refs/ref.types.js';
import type { EngineRef } from '../refs/ref.types.js';
import type { RefUsage } from '../refs/ref-usage.types.js';

export type ComponentFieldValue = PropertyRef | ComponentRef | RefUsage<EngineRef> | ComponentFieldMap;

export type ComponentFieldMap = {
  readonly [key: string]: ComponentFieldValue;
};
