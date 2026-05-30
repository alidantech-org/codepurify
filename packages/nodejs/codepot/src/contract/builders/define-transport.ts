// src/contract/builders/define-transport.ts

import type {
  ContentTypeDefinition,
  RequestDefinition,
  ResponseDefinition,
  TransportDefinition,
} from '@/contract/types/transport/definition';

import type { Ref } from '@/contract/types/ref';

import {
  AuthoringRefKind,
  type ContentTypeAuthoringRef,
  type RequestAuthoringRef,
  type ResponseAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import type {
  ContentTypeInput,
  ContentTypeInputMap,
  ContentTypesResult,
  DefaultResponseMap,
  RequestInput,
  RequestInputMap,
  RequestsResult,
  ResponseInput,
  ResponseInputMap,
  ResponsesResult,
  TransportBuilder,
  TransportDefaultsInput,
} from '@/contract/types/core/8.transport-builder';

import { contentType, request, response } from '@/contract/helpers/transport/transport';

import { createAuthoringRef, refPath } from '@/contract/helpers/refs/create-authoring-ref';

import { isAuthoringRef, isRefUsage, normalizeRefOrUsage } from '@/pipeline/compiler/refs/normalize-ref-usage';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineTransportOptions {
  readonly initial?: Partial<TransportDefinition>;
}

// ============================================================================
// PATHS
// ============================================================================

function contentTypePath(key: string): Ref<ContentTypeDefinition> {
  return refPath<ContentTypeDefinition>(`#/transport/contentTypes/${key}`);
}

function requestPath(key: string): Ref<RequestDefinition> {
  return refPath<RequestDefinition>(`#/transport/requests/${key}`);
}

function responsePath(key: string): Ref<ResponseDefinition> {
  return refPath<ResponseDefinition>(`#/transport/responses/${key}`);
}

// ============================================================================
// REFS
// ============================================================================

function createContentTypeRef(key: string): ContentTypeAuthoringRef {
  return createAuthoringRef({
    path: contentTypePath(key),
    kind: AuthoringRefKind.transportContentType,
    key,
    name: key,
  });
}

function createRequestRef(key: string): RequestAuthoringRef {
  return createAuthoringRef({
    path: requestPath(key),
    kind: AuthoringRefKind.transportRequest,
    key,
    name: key,
  });
}

function createResponseRef(key: string): ResponseAuthoringRef {
  return createAuthoringRef({
    path: responsePath(key),
    kind: AuthoringRefKind.transportResponse,
    key,
    name: key,
  });
}

// ============================================================================
// NORMALIZATION
// ============================================================================

function normalizeMaybeSchema(value: unknown): unknown {
  if (!value) return undefined;

  if (isAuthoringRef(value) || isRefUsage(value)) {
    return normalizeRefOrUsage(value);
  }

  return value;
}

function normalizeContentType(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (isAuthoringRef(value)) return value.path;
  return undefined;
}

function toContentTypeDefinition(input: ContentTypeInput): ContentTypeDefinition {
  return {
    value: input.value,
    strategy: input.strategy,
    description: input.description,
    deprecated: input.deprecated,
    meta: input.meta,
  };
}

function toResponseDefinition(input: ResponseInput): ResponseDefinition {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
    schema: normalizeMaybeSchema(obj.schema),
    contentType: normalizeContentType(obj.contentType),
  } as ResponseDefinition;
}

function toRequestDefinition(input: RequestInput): RequestDefinition {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
    schema: normalizeMaybeSchema(obj.schema),
    contentType: normalizeContentType(obj.contentType),
  } as RequestDefinition;
}

function toAuthoringState<TValue>(value: TValue): TValue {
  return value;
}

// ============================================================================
// DEFINE TRANSPORT
// ============================================================================

export function defineTransport(options: DefineTransportOptions = {}): TransportBuilder {
  const contentTypes: Record<string, ContentTypeDefinition> = {
    ...(options.initial?.contentTypes ?? {}),
  };

  const requests: Record<string, RequestInput> = {
    ...((options.initial?.requests ?? {}) as unknown as Record<string, RequestInput>),
  };

  const responses: Record<string, ResponseInput> = {
    ...((options.initial?.responses ?? {}) as unknown as Record<string, ResponseInput>),
  };

  let defaults: TransportDefaultsInput | undefined = options.initial?.defaults as unknown as TransportDefaultsInput | undefined;

  function snapshot(): Partial<TransportDefinition> {
    return {
      contentTypes,
      requests: Object.fromEntries(Object.entries(requests).map(([key, value]) => [key, toRequestDefinition(value)])) as Record<
        string,
        RequestDefinition
      >,
      responses: Object.fromEntries(Object.entries(responses).map(([key, value]) => [key, toResponseDefinition(value)])) as Record<
        string,
        ResponseDefinition
      >,
      defaults: defaults as unknown as TransportDefinition['defaults'],
    };
  }

  function defineContentTypes<TInput extends ContentTypeInputMap>(input: TInput): ContentTypesResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: ContentTypeAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      contentTypes[key] = toContentTypeDefinition(value);
      refs[key] = createContentTypeRef(key);
    }

    return {
      contentTypes: input,
      ref: refs,
    };
  }

  function defineRequests<TInput extends RequestInputMap>(input: TInput): RequestsResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: RequestAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      requests[key] = toAuthoringState(value);
      refs[key] = createRequestRef(key);
    }

    return {
      requests: input,
      ref: refs,
    };
  }

  function defineResponses<TInput extends ResponseInputMap>(input: TInput): ResponsesResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: ResponseAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      responses[key] = toAuthoringState(value);
      refs[key] = createResponseRef(key);
    }

    return {
      responses: input,
      ref: refs,
    };
  }

  const builder: TransportBuilder = {
    get state() {
      return snapshot();
    },

    contentType,
    request,
    response,

    defineContentTypes,

    defineRequests,

    defineResponses,

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
