import { Ref } from '../../_shared/ref/definition';

export const HttpMethod = {
  get: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  delete: 'delete',
  options: 'options',
  head: 'head',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export interface RouteSecurityDefinition<TAuth = unknown, TRoleSet = unknown, TGuard = unknown> {
  protected: boolean;
  auth?: Ref<TAuth>;
  roleSets?: Ref<TRoleSet>[];
  guards?: Ref<TGuard>[];
  meta: Record<string, unknown>;
}

export interface RouteBodyDefinition<TSchema = unknown, TContentType = unknown> {
  schema: Ref<TSchema>;
  contentType: Ref<TContentType>;
}

export interface RouteQueryDefinition<TSchema = unknown> {
  schema: Ref<TSchema>;
}

export type RouteResponsesDefinition<TResponse = unknown> = Record<number, Ref<TResponse>>;

export interface RouteMethodDefinition<
  TOperation = unknown,
  TAuth = unknown,
  TRoleSet = unknown,
  TGuard = unknown,
  TQuery = unknown,
  TBody = unknown,
  TContentType = unknown,
  TResponse = unknown,
> {
  operation: Ref<TOperation>;

  summary?: string;
  description?: string;

  security?: RouteSecurityDefinition<TAuth, TRoleSet, TGuard>;

  query?: RouteQueryDefinition<TQuery>;

  body?: RouteBodyDefinition<TBody, TContentType>;

  responses: RouteResponsesDefinition<TResponse>;

  meta: Record<string, unknown>;
}

export interface RoutePathDefinition<
  TOperation = unknown,
  TParameter = unknown,
  TAuth = unknown,
  TRoleSet = unknown,
  TGuard = unknown,
  TQuery = unknown,
  TBody = unknown,
  TContentType = unknown,
  TResponse = unknown,
> {
  parameters?: Record<string, Ref<TParameter>>;

  get?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  post?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  put?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  patch?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  delete?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  options?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  head?: RouteMethodDefinition<TOperation, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>;

  meta: Record<string, unknown>;
}

export type RoutesDefinition<
  TOperation = unknown,
  TParameter = unknown,
  TAuth = unknown,
  TRoleSet = unknown,
  TGuard = unknown,
  TQuery = unknown,
  TBody = unknown,
  TContentType = unknown,
  TResponse = unknown,
> = Record<string, RoutePathDefinition<TOperation, TParameter, TAuth, TRoleSet, TGuard, TQuery, TBody, TContentType, TResponse>>;
