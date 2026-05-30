/**
 * Final IR ref type for compiler output.
 * This should NOT be imported or used in contract builders/helpers.
 * Contract layer uses AuthoringRef with engine ID only.
 */
export interface Ref<TTarget> {
  readonly $ref: string;
  readonly __target?: TTarget;
}

/**
 * Final IR ref factory for compiler output.
 * This should NOT be imported or used in contract builders/helpers.
 */
export function ref<TTarget>(value: string): Ref<TTarget> {
  return {
    $ref: value,
  } as Ref<TTarget>;
}

/**
 * Final IR usage definitions for array and ref usage.
 * These are used in final IR types (e.g., EntityField).
 */
export interface ArrayUsageDefinition {
  readonly min?: number;
  readonly max?: number;
  readonly unique?: boolean;
}

export interface RefUsageDefinition {
  readonly description?: string;
  readonly deprecated?: boolean;
  readonly meta?: Record<string, unknown>;
}
