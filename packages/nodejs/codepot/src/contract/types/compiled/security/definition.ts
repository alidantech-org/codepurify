import type { DefinitionItem } from '@/contract/types/compiled/definition';

import type { EntityFieldAuthoringRef, PrimitiveAuthoringRef, PropertyAuthoringRef } from '@/contract/types/core/3.authoring-ref';

// ============================================================================
// CREDENTIALS
// ============================================================================

export const SecurityCredentialSource = {
  header: 'header',
  cookie: 'cookie',
  query: 'query',
} as const;

export type SecurityCredentialSource = (typeof SecurityCredentialSource)[keyof typeof SecurityCredentialSource];

export const SecurityCredentialFormat = {
  raw: 'raw',
  bearer: 'bearer',
  basic: 'basic',
  apiKey: 'api_key',
  session: 'session',
} as const;

export type SecurityCredentialFormat = (typeof SecurityCredentialFormat)[keyof typeof SecurityCredentialFormat];

export type SecurityCredentialValueType = PrimitiveAuthoringRef | PropertyAuthoringRef;

export interface SecurityCredentialDefinition extends DefinitionItem {
  readonly source: SecurityCredentialSource;
  readonly key: string;
  readonly format?: SecurityCredentialFormat;
  readonly valueType?: SecurityCredentialValueType;
}

// ============================================================================
// PRINCIPALS
// ============================================================================

export type SecurityPrincipalFieldRef = EntityFieldAuthoringRef;

export type SecurityPrincipalFields = Record<string, SecurityPrincipalFieldRef>;

export interface SecurityPrincipalDefinition extends DefinitionItem {
  readonly fields: SecurityPrincipalFields;
}

// ============================================================================
// POLICIES
// ============================================================================

export const SecurityPolicyMode = {
  public: 'public',
  protected: 'protected',
} as const;

export type SecurityPolicyMode = (typeof SecurityPolicyMode)[keyof typeof SecurityPolicyMode];

export interface SecurityPolicyDefinition extends DefinitionItem {
  readonly mode: SecurityPolicyMode;

  readonly credential?: unknown;
  readonly principals?: Record<string, unknown>;

  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];

  /**
   * Generator-facing intent, not runtime logic.
   * Examples: "authenticated", "tenant_role", "owner_only", "api_key".
   */
  readonly intent?: string;
}

// ============================================================================
// ROOT SECURITY
// ============================================================================

export interface SecurityDefinition {
  readonly credentials: Record<string, SecurityCredentialDefinition>;
  readonly principals: Record<string, SecurityPrincipalDefinition>;
  readonly policies: Record<string, SecurityPolicyDefinition>;
}
