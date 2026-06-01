// src/contract/types/compiled/security/definition.ts

import type { DefinitionItem } from '../definition';
import type { Ref } from '../ref';
import type { PrimitiveDefinition } from '../properties/primitive/definition';
import type { EntityFieldDefinition } from '../schema/entity/field/definition';

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

export interface SecurityCredentialDefinition extends DefinitionItem {
  readonly source: SecurityCredentialSource;
  readonly key: string;
  readonly format?: SecurityCredentialFormat;
  readonly value_type?: Ref<PrimitiveDefinition>;
}

// ============================================================================
// PRINCIPALS
// ============================================================================

export type SecurityPrincipalFields = Record<string, Ref<EntityFieldDefinition>>;

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

  readonly credential?: Ref<SecurityCredentialDefinition>;
  readonly principals?: Record<string, Ref<SecurityPrincipalDefinition>>;

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
