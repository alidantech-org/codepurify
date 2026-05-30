import type { Ref } from '@/contract/types/ref';
import type {
  AuthoringRef,
  AuthoringRefKind,
  RefUsage,
} from '@/contract/types/core/3.authoring-ref';

export interface CompiledRefUsage<TTarget> {
  readonly ref: Ref<TTarget>;
  readonly array?: true | {
    readonly minItems?: number;
    readonly maxItems?: number;
    readonly uniqueItems?: boolean;
  };
  readonly required?: boolean;
  readonly nullable?: boolean;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isAuthoringRef(value: unknown): value is AuthoringRef<unknown, AuthoringRefKind> {
  return (
    isObject(value) &&
    typeof value.path === 'string' &&
    typeof value.kind === 'string' &&
    typeof value.key === 'string'
  );
}

export function isRefUsage(value: unknown): value is RefUsage<unknown, AuthoringRefKind> {
  return (
    isObject(value) &&
    isAuthoringRef(value.ref) &&
    isObject(value.usage)
  );
}

export function normalizeRefOrUsage<TTarget>(
  value: AuthoringRef<TTarget, AuthoringRefKind> | RefUsage<TTarget, AuthoringRefKind>,
): CompiledRefUsage<TTarget> {
  if (isRefUsage(value)) {
    return {
      ref: value.ref.path as Ref<TTarget>,
      array: value.usage.array,
      required: value.usage.required,
      nullable: value.usage.nullable,
    };
  }

  return {
    ref: value.path as Ref<TTarget>,
  };
}
