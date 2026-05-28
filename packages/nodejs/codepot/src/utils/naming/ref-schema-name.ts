import { ComponentRef, ModelRef } from '@/contract/refs/ref.types';
import { toSchemaName } from './schema-name';

export function modelRefToSchemaName(ref: ModelRef): string {
  return toSchemaName(ref.name);
}

export function componentRefToSchemaName(ref: ComponentRef): string {
  return toSchemaName(ref.name);
}
