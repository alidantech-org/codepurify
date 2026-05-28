import { RefUsage, ExtendWithInput } from '@/contract/refs/ref-usage.types';
import { EngineRef } from '@/contract/refs/ref.types';
import { isEngineRef } from './ref-guards';

export function isRefUsage(value: unknown): value is RefUsage<EngineRef> {
  return !!value && typeof value === 'object' && 'ref' in value && 'usage' in value && isEngineRef(value.ref);
}

export function getRefRequired(value: unknown): boolean | undefined {
  return isRefUsage(value) ? value.usage.required : undefined;
}

export function getRefNullable(value: unknown): boolean | undefined {
  return isRefUsage(value) ? value.usage.nullable : undefined;
}

export function getRefArray(value: unknown): boolean | undefined {
  return isRefUsage(value) ? value.usage.array : undefined;
}

export function getRefExtendWith(value: unknown): ExtendWithInput | undefined {
  return isRefUsage(value) ? value.usage.extendWith : undefined;
}
