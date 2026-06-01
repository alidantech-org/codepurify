// src/contract/builders/define-errors.ts

import type { ErrorDefinition, ErrorsDefinition } from '@/contract/types/errors/definition';

import type { ErrorInputMap, ErrorsBuilder, ErrorsResult } from '@/contract/types/core/8.errors-builder';

import { content } from '@/contract/helpers/content/content';
import { error } from '@/contract/helpers/errors/error';
import { errorRef } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineErrorsOptions {
  readonly state: Partial<ErrorsDefinition>;
}

// ============================================================================
// MUTABLE STATE TYPES
// ============================================================================

type MutableErrorsState = {
  errors?: ErrorsDefinition['errors'];
};

// ============================================================================
// STATE HELPERS
// ============================================================================

function ensureState(state: Partial<ErrorsDefinition>): ErrorsDefinition {
  const mutable = state as MutableErrorsState;

  mutable.errors ??= {};

  return mutable as ErrorsDefinition;
}

function createErrorRefs<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput>['ref'] {
  const refs = {} as Record<keyof TInput & string, ReturnType<typeof errorRef>>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = errorRef(key);
  }

  return refs as ErrorsResult<TInput>['ref'];
}

function writeErrors<TInput extends ErrorInputMap>(state: ErrorsDefinition, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.errors[key] = value as unknown as ErrorDefinition;
  }
}

// ============================================================================
// DEFINE ERRORS
// ============================================================================

export function defineErrors(options: DefineErrorsOptions): ErrorsBuilder {
  const builder: ErrorsBuilder = {
    get state() {
      return options.state;
    },

    content,

    error,

    define<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput> {
      const state = ensureState(options.state);

      writeErrors(state, input);

      return {
        errors: input,
        ref: createErrorRefs(input),
      };
    },

    snapshot() {
      return options.state;
    },
  };

  return builder;
}
