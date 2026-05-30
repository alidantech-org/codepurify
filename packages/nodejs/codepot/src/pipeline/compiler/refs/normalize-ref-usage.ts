import type { Ref } from '@/contract/types/ref';
import type { AuthoringRef, AuthoringRefKind, RefUsage } from '@/contract/types/core/3.authoring-ref';

export interface CompiledRefUsage {
  readonly $ref: string;
  readonly array?:
    | true
    | {
        readonly minItems?: number;
        readonly maxItems?: number;
        readonly uniqueItems?: boolean;
      };
  readonly required?: boolean;
  readonly nullable?: boolean;
  readonly extendWith?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isIrRef(value: unknown): value is Ref<unknown> {
  return isRecord(value) && typeof value.$ref === 'string';
}

export function isAuthoringRef(value: unknown): value is AuthoringRef<unknown, AuthoringRefKind> {
  return isRecord(value) && isIrRef(value.path) && typeof value.kind === 'string' && typeof value.key === 'string';
}

export function isRefUsage(value: unknown): value is RefUsage<unknown, AuthoringRefKind> {
  return isRecord(value) && isAuthoringRef(value.ref) && isRecord(value.usage);
}

export function normalizeRefOrUsage<TTarget>(
  value: AuthoringRef<TTarget, AuthoringRefKind> | RefUsage<TTarget, AuthoringRefKind>,
): CompiledRefUsage {
  if (isRefUsage(value)) {
    return {
      $ref: value.ref.path.$ref,
      array: value.usage.array,
      required: value.usage.required,
      nullable: value.usage.nullable,
      extendWith: value.usage.extendWith,
    };
  }

  return {
    $ref: value.path.$ref,
  };
}

export function normalizeRefOrUsagePlain(value: unknown): unknown {
  if (isRefUsage(value)) {
    return {
      $ref: value.ref.path.$ref,
      array: value.usage.array,
      required: value.usage.required,
      nullable: value.usage.nullable,
      extendWith: value.usage.extendWith,
    };
  }

  if (isAuthoringRef(value)) {
    return {
      $ref: value.path.$ref,
    };
  }

  if (isIrRef(value)) {
    return value;
  }

  return value;
}
