import type { DefinitionItem } from '@/contract/types/definition';

import type {
  ApiKeyLocation,
  ResourceSecurityDefinition,
  RouteSecurityDefinition,
  SecurityAuthDefinition,
  SecurityAuthMode,
  SecurityContextDefinition,
  SecurityDefinition,
  SecurityGuardDefinition,
  SecurityRoleSetDefinition,
  SecurityRoleSourceDefinition,
  SecuritySchemeDefinition,
  SecuritySchemeType,
} from '@/contract/types/security/definition';

import type {
  DtoAuthoringRef,
  EntityFieldAuthoringRef,
  EnumAuthoringRef,
  SecurityAuthAuthoringRef,
  SecurityContextAuthoringRef,
  SecurityGuardAuthoringRef,
  SecurityRoleSetAuthoringRef,
  SecurityRoleSourceAuthoringRef,
  SecuritySchemeAuthoringRef,
} from './3.authoring-ref';

// ============================================================================
// SECURITY SCHEMES
// ============================================================================

export interface HttpSecuritySchemeInput extends DefinitionItem {
  readonly type: typeof SecuritySchemeType.http;
  readonly scheme: string;
  readonly bearerFormat?: string;
}

export interface ApiKeySecuritySchemeInput extends DefinitionItem {
  readonly type: typeof SecuritySchemeType.apiKey;
  readonly in: ApiKeyLocation;
  readonly keyName: string;
}

export interface OAuth2SecuritySchemeInput extends DefinitionItem {
  readonly type: typeof SecuritySchemeType.oauth2;
  readonly flows: Record<string, unknown>;
}

export interface OpenIdSecuritySchemeInput extends DefinitionItem {
  readonly type: typeof SecuritySchemeType.openId;
  readonly openIdConnectUrl: string;
}

export type SecuritySchemeInput =
  | HttpSecuritySchemeInput
  | ApiKeySecuritySchemeInput
  | OAuth2SecuritySchemeInput
  | OpenIdSecuritySchemeInput;

export type SecuritySchemeInputMap = Record<string, SecuritySchemeInput>;

export interface SecuritySchemesResult<TInput extends SecuritySchemeInputMap> {
  readonly schemes: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecuritySchemeAuthoringRef;
  };
}

// ============================================================================
// AUTH
// ============================================================================

export interface SecurityAuthSchemeInput extends DefinitionItem {
  readonly scheme: SecuritySchemeAuthoringRef;
  readonly scopes?: readonly string[];
}

export interface SecurityAuthInput extends DefinitionItem {
  readonly mode: SecurityAuthMode;
  readonly schemes: readonly SecurityAuthSchemeInput[];
}

export type SecurityAuthInputMap = Record<string, SecurityAuthInput>;

export interface SecurityAuthResult<TInput extends SecurityAuthInputMap> {
  readonly auth: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityAuthAuthoringRef;
  };
}

// ============================================================================
// ROLES
// ============================================================================

export interface SecurityRoleSourceInput extends DefinitionItem {
  /**
   * Entity field that stores role values.
   */
  readonly source: EntityFieldAuthoringRef;

  /**
   * Enum that defines valid role values.
   */
  readonly enum: EnumAuthoringRef;
}

export type SecurityRoleSourceInputMap = Record<string, SecurityRoleSourceInput>;

export interface SecurityRoleSourcesResult<TInput extends SecurityRoleSourceInputMap> {
  readonly roleSources: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityRoleSourceAuthoringRef;
  };
}

export interface SecurityRoleSetInput extends DefinitionItem {
  readonly role: SecurityRoleSourceAuthoringRef;

  /**
   * Enum value keys.
   * Compiler validates these exist in the referenced enum.
   */
  readonly values: readonly string[];
}

export type SecurityRoleSetInputMap = Record<string, SecurityRoleSetInput>;

export interface SecurityRoleSetsResult<TInput extends SecurityRoleSetInputMap> {
  readonly roleSets: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityRoleSetAuthoringRef;
  };
}

// ============================================================================
// CONTEXTS
// ============================================================================

export interface SecurityContextInput extends DefinitionItem {
  readonly target: string;
  readonly schema: DtoAuthoringRef;
}

export type SecurityContextInputMap = Record<string, SecurityContextInput>;

export interface SecurityContextsResult<TInput extends SecurityContextInputMap> {
  readonly contexts: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityContextAuthoringRef;
  };
}

// ============================================================================
// GUARDS
// ============================================================================

export interface SecurityGuardInput extends DefinitionItem {
  readonly handler: string;
  readonly outputs?: readonly SecurityContextAuthoringRef[];
}

export type SecurityGuardInputMap = Record<string, SecurityGuardInput>;

export interface SecurityGuardsResult<TInput extends SecurityGuardInputMap> {
  readonly guards: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityGuardAuthoringRef;
  };
}

// ============================================================================
// ROUTE / RESOURCE SECURITY INPUT
// ============================================================================

export interface RouteSecurityRefsInput extends DefinitionItem {
  readonly auth?: SecurityAuthAuthoringRef;
  readonly roleSets?: readonly SecurityRoleSetAuthoringRef[];
  readonly guards?: readonly SecurityGuardAuthoringRef[];
}

export interface RouteSecurityInput extends RouteSecurityRefsInput {
  readonly protected: boolean;
}

export type ResourceSecurityInput = RouteSecurityInput;

// ============================================================================
// HELPERS
// ============================================================================

export interface SecuritySchemeHelper {
  bearer(options?: Omit<HttpSecuritySchemeInput, 'type' | 'scheme'>): HttpSecuritySchemeInput;

  bearerJwt(options?: Omit<HttpSecuritySchemeInput, 'type' | 'scheme'>): HttpSecuritySchemeInput;

  basic(options?: Omit<HttpSecuritySchemeInput, 'type' | 'scheme'>): HttpSecuritySchemeInput;

  http(scheme: string, options?: Omit<HttpSecuritySchemeInput, 'type' | 'scheme'>): HttpSecuritySchemeInput;

  apiKey(
    keyName: string,
    location: ApiKeyLocation,
    options?: Omit<ApiKeySecuritySchemeInput, 'type' | 'keyName' | 'in'>,
  ): ApiKeySecuritySchemeInput;

  apiKeyHeader(keyName: string, options?: Omit<ApiKeySecuritySchemeInput, 'type' | 'keyName' | 'in'>): ApiKeySecuritySchemeInput;

  apiKeyQuery(keyName: string, options?: Omit<ApiKeySecuritySchemeInput, 'type' | 'keyName' | 'in'>): ApiKeySecuritySchemeInput;

  apiKeyCookie(keyName: string, options?: Omit<ApiKeySecuritySchemeInput, 'type' | 'keyName' | 'in'>): ApiKeySecuritySchemeInput;

  oauth2(flows: Record<string, unknown>, options?: Omit<OAuth2SecuritySchemeInput, 'type' | 'flows'>): OAuth2SecuritySchemeInput;

  openId(openIdConnectUrl: string, options?: Omit<OpenIdSecuritySchemeInput, 'type' | 'openIdConnectUrl'>): OpenIdSecuritySchemeInput;
}

export interface SecurityAuthHelper {
  any(schemes: readonly SecurityAuthSchemeInput[], options?: Omit<SecurityAuthInput, 'mode' | 'schemes'>): SecurityAuthInput;

  all(schemes: readonly SecurityAuthSchemeInput[], options?: Omit<SecurityAuthInput, 'mode' | 'schemes'>): SecurityAuthInput;

  scheme(scheme: SecuritySchemeAuthoringRef, scopes?: readonly string[]): SecurityAuthSchemeInput;
}

export interface SecurityRouteHelper {
  public(options?: DefinitionItem): RouteSecurityInput;

  protected(input?: RouteSecurityRefsInput): RouteSecurityInput;

  auth(auth: SecurityAuthAuthoringRef, options?: Omit<RouteSecurityRefsInput, 'auth'>): RouteSecurityInput;

  roles(roleSets: readonly SecurityRoleSetAuthoringRef[], options?: Omit<RouteSecurityRefsInput, 'roleSets'>): RouteSecurityInput;

  guards(guards: readonly SecurityGuardAuthoringRef[], options?: Omit<RouteSecurityRefsInput, 'guards'>): RouteSecurityInput;

  custom(input: RouteSecurityInput): RouteSecurityInput;
}

export interface SecurityContextHelper {
  dto(target: string, schema: DtoAuthoringRef, options?: Omit<SecurityContextInput, 'target' | 'schema'>): SecurityContextInput;
}

export interface SecurityGuardHelper {
  handler(handler: string, options?: Omit<SecurityGuardInput, 'handler'>): SecurityGuardInput;
}

export interface SecurityRoleSourceHelper {
  entityField(
    source: EntityFieldAuthoringRef,
    enumRef: EnumAuthoringRef,
    options?: Omit<SecurityRoleSourceInput, 'source' | 'enum'>,
  ): SecurityRoleSourceInput;
}

export interface SecurityRoleSetHelper {
  values(
    role: SecurityRoleSourceAuthoringRef,
    values: readonly string[],
    options?: Omit<SecurityRoleSetInput, 'role' | 'values'>,
  ): SecurityRoleSetInput;
}

// ============================================================================
// SECURITY AUTHORING STATE
// ============================================================================

export interface SecurityAuthoringState {
  readonly schemes: Record<string, SecuritySchemeDefinition>;
  readonly auth: Record<string, SecurityAuthDefinition>;
  readonly roleSources?: Record<string, SecurityRoleSourceDefinition>;
  readonly roleSets?: Record<string, SecurityRoleSetDefinition>;
  readonly contexts?: Record<string, SecurityContextDefinition>;
  readonly guards?: Record<string, SecurityGuardDefinition>;
  readonly defaults?: RouteSecurityDefinition;
}

// ============================================================================
// SECURITY BUILDER
// ============================================================================

export interface SecurityBuilder {
  readonly state: Partial<SecurityDefinition>;

  readonly scheme: SecuritySchemeHelper;
  readonly auth: SecurityAuthHelper;
  readonly context: SecurityContextHelper;
  readonly guard: SecurityGuardHelper;
  readonly roleSource: SecurityRoleSourceHelper;
  readonly roleSet: SecurityRoleSetHelper;
  readonly route: SecurityRouteHelper;

  defineSchemes<TInput extends SecuritySchemeInputMap>(input: TInput): SecuritySchemesResult<TInput>;

  defineAuth<TInput extends SecurityAuthInputMap>(input: TInput): SecurityAuthResult<TInput>;

  defineRoleSources<TInput extends SecurityRoleSourceInputMap>(input: TInput): SecurityRoleSourcesResult<TInput>;

  defineRoleSets<TInput extends SecurityRoleSetInputMap>(input: TInput): SecurityRoleSetsResult<TInput>;

  defineContexts<TInput extends SecurityContextInputMap>(input: TInput): SecurityContextsResult<TInput>;

  defineGuards<TInput extends SecurityGuardInputMap>(input: TInput): SecurityGuardsResult<TInput>;

  setDefaults(defaults: RouteSecurityInput): SecurityBuilder;

  snapshot(): Partial<SecurityDefinition>;
}
