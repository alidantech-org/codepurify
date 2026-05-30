import type {
  ArrayUsageOptions,
  AuthoringRef,
  AuthoringRefBase,
  AuthoringRefKind,
  ExtendableAuthoringRef,
  ExtendableRefUsage,
  RefUsage,
  RefUsageOptions,
} from '@/contract/types/core/3.authoring-ref';

import type { Ref } from '@/contract/types/ref';

// ============================================================================
// CREATE AUTHORING REF INPUTS
// ============================================================================

export interface CreateAuthoringRefInput<TTarget, TKind extends AuthoringRefKind> {
  readonly path: Ref<TTarget>;
  readonly kind: TKind;
  readonly key: string;
  readonly name?: string;
}

export type CreateExtendableAuthoringRefInput<TTarget, TKind extends AuthoringRefKind> = CreateAuthoringRefInput<TTarget, TKind>;

// ============================================================================
// AUTHORING REF FACTORIES
// ============================================================================

export function createAuthoringRef<TTarget, TKind extends AuthoringRefKind>(
  input: CreateAuthoringRefInput<TTarget, TKind>,
): AuthoringRef<TTarget, TKind> {
  const base: AuthoringRefBase<TTarget, TKind> = {
    path: input.path,
    kind: input.kind,
    key: input.key,
    name: input.name,
  };

  return {
    ...base,

    optional() {
      return createUsage(base, { required: false });
    },

    required() {
      return createUsage(base, { required: true });
    },

    nullable() {
      return createUsage(base, { nullable: true });
    },

    nonNullable() {
      return createUsage(base, { nullable: false });
    },

    array(options: true | ArrayUsageOptions = true) {
      return createUsage(base, { array: options });
    },
  };
}

export function createExtendableAuthoringRef<TTarget, TKind extends AuthoringRefKind, TExtension>(
  input: CreateExtendableAuthoringRefInput<TTarget, TKind>,
): ExtendableAuthoringRef<TTarget, TKind, TExtension> {
  const base: AuthoringRefBase<TTarget, TKind> = {
    path: input.path,
    kind: input.kind,
    key: input.key,
    name: input.name,
  };

  return {
    ...base,

    optional() {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        required: false,
      });
    },

    required() {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        required: true,
      });
    },

    nullable() {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        nullable: true,
      });
    },

    nonNullable() {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        nullable: false,
      });
    },

    array(options: true | ArrayUsageOptions = true) {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        array: options,
      });
    },

    extendWith(fields: TExtension) {
      return createExtendableUsage<TTarget, TKind, TExtension>(base, {
        extendWith: { fields },
      });
    },
  };
}

// ============================================================================
// USAGE FACTORIES
// ============================================================================

export function createUsage<TTarget, TKind extends AuthoringRefKind>(
  ref: AuthoringRefBase<TTarget, TKind>,
  usage: RefUsageOptions = {},
): RefUsage<TTarget, TKind> {
  const authoringRef = createAuthoringRef<TTarget, TKind>(ref);

  return {
    ref: authoringRef,
    usage,

    optional() {
      return createUsage(ref, { ...usage, required: false });
    },

    required() {
      return createUsage(ref, { ...usage, required: true });
    },

    nullable() {
      return createUsage(ref, { ...usage, nullable: true });
    },

    nonNullable() {
      return createUsage(ref, { ...usage, nullable: false });
    },

    array(options: true | ArrayUsageOptions = true) {
      return createUsage(ref, { ...usage, array: options });
    },

    single() {
      const { array: _array, ...nextUsage } = usage;

      return createUsage(ref, nextUsage);
    },
  };
}

export function createExtendableUsage<TTarget, TKind extends AuthoringRefKind, TExtension>(
  ref: AuthoringRefBase<TTarget, TKind>,
  usage: RefUsageOptions<TExtension> = {},
): ExtendableRefUsage<TTarget, TKind, TExtension> {
  const authoringRef = createExtendableAuthoringRef<TTarget, TKind, TExtension>(ref);

  return {
    ref: authoringRef,
    usage,

    optional() {
      return createExtendableUsage(ref, { ...usage, required: false });
    },

    required() {
      return createExtendableUsage(ref, { ...usage, required: true });
    },

    nullable() {
      return createExtendableUsage(ref, { ...usage, nullable: true });
    },

    nonNullable() {
      return createExtendableUsage(ref, { ...usage, nullable: false });
    },

    array(options: true | ArrayUsageOptions = true) {
      return createExtendableUsage(ref, { ...usage, array: options });
    },

    single() {
      const { array: _array, ...nextUsage } = usage;

      return createExtendableUsage(ref, nextUsage);
    },

    extendWith(fields: TExtension) {
      return createExtendableUsage(ref, {
        ...usage,
        extendWith: { fields },
      });
    },
  };
}

// ============================================================================
// REF PATH HELPER
// ============================================================================

export function refPath<TTarget>(path: string): Ref<TTarget> {
  return path as Ref<TTarget>;
}
