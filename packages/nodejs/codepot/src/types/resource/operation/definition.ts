import { Ref } from '../../ref/definition';

export interface OperationInputDefinition<TParams = unknown, TQuery = unknown, TBody = unknown, TContext = unknown> {
  context?: Ref<TContext>[];

  params?: Ref<TParams>;

  query?: Ref<TQuery>;

  body?: Ref<TBody>;
}

export interface OperationOutputDefinition<TResult = unknown, TError = unknown> {
  result?: Ref<TResult>;

  error?: Ref<TError>;
}

export interface OperationDefinition<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  TContext = unknown,
  TResult = unknown,
  TError = unknown,
> {
  description?: string;

  input?: OperationInputDefinition<TParams, TQuery, TBody, TContext>;

  output?: OperationOutputDefinition<TResult, TError>;

  metadata?: Record<string, unknown>;
}
