import { Ref } from '../_shared/ref/definition';
import { DefinitionItem } from '../definition';
import { EnumDefinition, EnumValueDefinition } from '../properties/enum/definition';
import { DtoDefinition } from '../schema/dto/definition';
import { EntityDefinition } from '../schema/entity/definition';

// ============================================================================
// SCHEMES
// ============================================================================

export const SecuritySchemeType = {
  http: 'http',
  apiKey: 'apiKey',
  oauth2: 'oauth2',
  openId: 'openId',
} as const;

export type SecuritySchemeType = (typeof SecuritySchemeType)[keyof typeof SecuritySchemeType];

export const ApiKeyLocation = {
  header: 'header',
  query: 'query',
  cookie: 'cookie',
} as const;

export type ApiKeyLocation = (typeof ApiKeyLocation)[keyof typeof ApiKeyLocation];

export interface SecuritySchemeDefinition extends DefinitionItem {
  type: SecuritySchemeType;
  // http
  scheme?: string;
  bearerFormat?: string;
  // apiKey
  in?: ApiKeyLocation;
  keyName?: string;
  // oauth2
  flows?: Record<string, unknown>;
  // openId
  openIdConnectUrl?: string;
}

// ============================================================================
// AUTH
// ============================================================================

export const SecurityAuthMode = {
  any: 'any',
  all: 'all',
} as const;

export type SecurityAuthMode = (typeof SecurityAuthMode)[keyof typeof SecurityAuthMode];

export interface SecurityAuthDefinition extends DefinitionItem {
  /**
   * Authentication mode: 'any' (at least one scheme required) or 'all' (all schemes required)
   */
  mode: SecurityAuthMode;

  /**
   * List of authentication schemes to use
   */
  schemes: Array<{
    /**
     * Reference to the security scheme definition
     */
    scheme: Ref<SecuritySchemeDefinition>;
    /**
     * Optional scopes required for this scheme
     */
    scopes?: string[];
  }>;
}

// ============================================================================
// ROLES
// ============================================================================

export interface SecurityRoleSourceDefinition extends DefinitionItem {
  /**
   * Reference to the entity field that contains role values
   */
  source: Ref<EntityDefinition>; // entity field ref
  /**
   * Reference to the enum definition that defines valid role values
   */
  enum: Ref<EnumDefinition>; // enum ref
}

export interface SecurityRoleSetDefinition extends DefinitionItem {
  /**
   * Reference to the role source definition
   */
  role: Ref<SecurityRoleSourceDefinition>;

  /**
   * List of role values
   */
  values: Ref<EnumValueDefinition>[];
}

// ============================================================================
// GUARDS & CONTEXTS
// ============================================================================

export interface SecurityContextDefinition extends DefinitionItem {
  /**
   * Target context identifier
   */
  target: string;
  /**
   * Reference to the schema definition
   */
  schema: Ref<DtoDefinition>;
}

export interface SecurityGuardDefinition extends DefinitionItem {
  /**
   * Handler function name
   */
  handler: string;
  /**
   * List of output contexts
   */
  outputs?: Ref<SecurityContextDefinition>[];
}

// ============================================================================
// ROUTE SECURITY
// ============================================================================

export interface RouteSecurityDefinition extends DefinitionItem {
  /**
   * Whether the route is protected
   */
  protected: boolean;
  /**
   * Reference to the authentication definition
   */
  auth?: Ref<SecurityAuthDefinition>;
  /**
   * List of role set references
   */
  roleSets?: Ref<SecurityRoleSetDefinition>[];
  /**
   * List of guard references
   */
  guards?: Ref<SecurityGuardDefinition>[];
}

export interface ResourceSecurityDefinition extends RouteSecurityDefinition {}

// ============================================================================
// REGISTRY
// ============================================================================

export interface SecurityDefinition extends DefinitionItem {
  /**
   * Security schemes
   */
  schemes: Record<string, SecuritySchemeDefinition>;
  /**
   * Authentication definitions
   */
  auth: Record<string, SecurityAuthDefinition>;
  /**
   * Role source definitions
   */
  roleSources?: Record<string, SecurityRoleSourceDefinition>;
  /**
   * Role set definitions
   */
  roleSets?: Record<string, SecurityRoleSetDefinition>;
  /**
   * Context definitions
   */
  contexts?: Record<string, SecurityContextDefinition>;
  /**
   * Guard definitions
   */
  guards?: Record<string, SecurityGuardDefinition>;

  /**
   * Default route security
   */
  defaults?: RouteSecurityDefinition;
}
