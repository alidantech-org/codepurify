/* =========================================================
 * SECURITY SCHEMES
 * OpenAPI-compatible auth scheme definitions.
 * ========================================================= */

import { Ref } from '../ref/definition';

export interface SecuritySchemeHttp {
  type: 'http';
  scheme: string;
  bearerFormat?: string;
}

export interface SecuritySchemeApiKey {
  type: 'apiKey';
  in: 'header' | 'query' | 'cookie';
  name: string;
}

export interface SecuritySchemeOAuth2 {
  type: 'oauth2';
  flows: Record<string, unknown>;
}

export interface SecuritySchemeOpenId {
  type: 'openIdConnect';
  openIdConnectUrl: string;
}

export type SecuritySchemeDefinition = SecuritySchemeHttp | SecuritySchemeApiKey | SecuritySchemeOAuth2 | SecuritySchemeOpenId;

/* =========================================================
 * AUTH REQUIREMENTS
 * Reusable combinations of auth schemes.
 * Example: bearer, session, bearerOrSession, bearerAndApiKey.
 * ========================================================= */

export type SecurityAuthMode = 'any' | 'all';

export interface SecurityAuthSchemeUse<TScheme = SecuritySchemeDefinition> {
  scheme: Ref<TScheme>;
  scopes?: string[];
}

export interface SecurityAuthDefinition<TScheme = SecuritySchemeDefinition> {
  mode: SecurityAuthMode;
  schemes: SecurityAuthSchemeUse<TScheme>[];
  description?: string;
  meta: Record<string, unknown>;
}

/* =========================================================
 * ROLE SOURCES / ROLE SETS
 * Roles are not hard-coded on routes.
 * They come from entity fields / enum fields through refs.
 * ========================================================= */

export interface SecurityRoleSourceDefinition<TField = unknown, TEnum = unknown> {
  source: Ref<TField>;
  enum: Ref<TEnum>;
  description?: string;
  meta: Record<string, unknown>;
}

export interface SecurityRoleSetDefinition<TRoleSource = SecurityRoleSourceDefinition, TEnumValue = unknown> {
  role: Ref<TRoleSource>;
  values: Ref<TEnumValue>[];
  description?: string;
  meta: Record<string, unknown>;
}

/* =========================================================
 * CONTEXTS
 * Typed runtime/request values created by guards.
 * Example: context.user, context.tenant, context.membership.
 * ========================================================= */

export interface SecurityContextDefinition<TSchema = unknown> {
  target: string;
  schema: Ref<TSchema>;
  description?: string;
  meta: Record<string, unknown>;
}

/* =========================================================
 * GUARDS
 * Named backend handlers.
 * They may output registered contexts.
 * ========================================================= */

export interface SecurityGuardDefinition<TContext = SecurityContextDefinition> {
  handler: string;
  outputs?: Ref<TContext>[];
  description?: string;
  meta: Record<string, unknown>;
}

/* =========================================================
 * ROUTE / RESOURCE SECURITY
 * This is what resources/routes use.
 * Refs only. No inline role values. No inline guards.
 * ========================================================= */

export interface RouteSecurityDefinition<
  TAuth = SecurityAuthDefinition,
  TRoleSet = SecurityRoleSetDefinition,
  TGuard = SecurityGuardDefinition,
> {
  protected: boolean;

  auth?: Ref<TAuth>;

  roleSets?: Ref<TRoleSet>[];

  guards?: Ref<TGuard>[];

  meta: Record<string, unknown>;
}

/* =========================================================
 * TOP-LEVEL SECURITY REGISTRY
 * Defined at version level.
 * ========================================================= */

export interface SecurityDefinition<
  TScheme = SecuritySchemeDefinition,
  TAuth = SecurityAuthDefinition<TScheme>,
  TRoleSource = SecurityRoleSourceDefinition,
  TRoleSet = SecurityRoleSetDefinition<TRoleSource>,
  TContext = SecurityContextDefinition,
  TGuard = SecurityGuardDefinition<TContext>,
> {
  defaults?: RouteSecurityDefinition<TAuth, TRoleSet, TGuard>;

  schemes: Record<string, TScheme>;

  auth: Record<string, TAuth>;

  roleSources?: Record<string, TRoleSource>;

  roleSets?: Record<string, TRoleSet>;

  contexts?: Record<string, TContext>;

  guards?: Record<string, TGuard>;

  meta: Record<string, unknown>;
}
