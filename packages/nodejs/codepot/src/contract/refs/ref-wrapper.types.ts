import type { z } from 'zod';
import type { EngineRef } from './ref.types';
import { ComponentFieldMap } from '@/pipeline/targets/openapi/components/component.types';

export interface ArrayRef<TRef extends EngineRef = EngineRef> {
  readonly kind: 'array-ref';
  readonly ref: TRef;
  zod(): z.ZodTypeAny;
}

export interface ExtendedRef<TRef extends EngineRef = EngineRef> {
  readonly kind: 'extended-ref';
  readonly ref: TRef;
  readonly fields: ComponentFieldMap;
  zod(): z.ZodTypeAny;
}
