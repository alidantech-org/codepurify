// src/contract/builders/define-transport.ts

import type {
  ContentTypeDefinition,
  RequestDefinition,
  ResponseDefinition,
  TransportDefinition,
} from '@/contract/types/transport/definition';

import type { ContentTypeAuthoringRef, RequestAuthoringRef, ResponseAuthoringRef } from '@/contract/types/core/3.authoring-ref';

import type {
  ContentTypeInputMap,
  ContentTypesResult,
  DefaultResponseMap,
  RequestInputMap,
  RequestsResult,
  ResponseInputMap,
  ResponsesResult,
  TransportBuilder,
  TransportDefaultsInput,
} from '@/contract/types/core/8.transport-builder';

import { contentType, request, response } from '@/contract/helpers/transport/transport';

import { contentTypeRef, requestRef, responseRef } from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineTransportOptions {
  readonly state?: Partial<TransportDefinition>;
  readonly initial?: Partial<TransportDefinition>;
}

// ============================================================================
// STATE HELPERS
// ============================================================================

function createInitialState(initial?: Partial<TransportDefinition>): Partial<TransportDefinition> {
  return {
    contentTypes: initial?.contentTypes ?? {},
    requests: initial?.requests ?? {},
    responses: initial?.responses ?? {},
    defaults: initial?.defaults,
  };
}

function ensureState(state: Partial<TransportDefinition>): Partial<TransportDefinition> {
  state.contentTypes ??= {};
  state.requests ??= {};
  state.responses ??= {};

  return state;
}

function writeContentTypes<TInput extends ContentTypeInputMap>(state: Partial<TransportDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.contentTypes![key] = value as unknown as ContentTypeDefinition;
  }
}

function writeRequests<TInput extends RequestInputMap>(state: Partial<TransportDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.requests![key] = value as unknown as RequestDefinition;
  }
}

function writeResponses<TInput extends ResponseInputMap>(state: Partial<TransportDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.responses![key] = value as unknown as ResponseDefinition;
  }
}

function createContentTypeRefs<TInput extends ContentTypeInputMap>(input: TInput): Record<keyof TInput & string, ContentTypeAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, ContentTypeAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = contentTypeRef(key);
  }

  return refs;
}

function createRequestRefs<TInput extends RequestInputMap>(input: TInput): Record<keyof TInput & string, RequestAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, RequestAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = requestRef(key);
  }

  return refs;
}

function createResponseRefs<TInput extends ResponseInputMap>(input: TInput): Record<keyof TInput & string, ResponseAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, ResponseAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = responseRef(key);
  }

  return refs;
}

// ============================================================================
// DEFINE TRANSPORT
// ============================================================================

export function defineTransport(options: DefineTransportOptions = {}): TransportBuilder {
  const state = ensureState(options.state ?? createInitialState(options.initial));

  let defaults = state.defaults as unknown as TransportDefaultsInput | undefined;

  function snapshot(): Partial<TransportDefinition> {
    state.defaults = defaults as unknown as TransportDefinition['defaults'];
    return state;
  }

  const builder: TransportBuilder = {
    get state() {
      return snapshot();
    },

    contentType,
    request,
    response,

    defineContentTypes<TInput extends ContentTypeInputMap>(input: TInput): ContentTypesResult<TInput> {
      writeContentTypes(state, input);

      return {
        contentTypes: input,
        ref: createContentTypeRefs(input) as ContentTypesResult<TInput>['ref'],
      };
    },

    defineRequests<TInput extends RequestInputMap>(input: TInput): RequestsResult<TInput> {
      writeRequests(state, input);

      return {
        requests: input,
        ref: createRequestRefs(input) as RequestsResult<TInput>['ref'],
      };
    },

    defineResponses<TInput extends ResponseInputMap>(input: TInput): ResponsesResult<TInput> {
      writeResponses(state, input);

      return {
        responses: input,
        ref: createResponseRefs(input) as ResponsesResult<TInput>['ref'],
      };
    },

    setDefaults(nextDefaults) {
      defaults = nextDefaults;
      return builder;
    },

    setDefaultResponses(nextResponses: DefaultResponseMap) {
      defaults = {
        ...(defaults ?? {}),
        responses: nextResponses,
      };

      return builder;
    },

    snapshot,
  };

  return builder;
}
