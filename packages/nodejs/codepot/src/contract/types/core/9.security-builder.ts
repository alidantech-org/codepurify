import type { DefinitionItem } from '@/contract/types/compiled/definition';

import type {
  SecurityCredentialFormat,
  SecurityCredentialSource,
  SecurityDefinition,
  SecurityPolicyDefinition,
} from '@/contract/types/compiled/security/definition';

import type {
  EntityFieldAuthoringRef,
  PropertyAuthoringRef,
  SecurityCredentialAuthoringRef,
  SecurityPolicyAuthoringRef,
  SecurityPrincipalAuthoringRef,
} from './3.authoring-ref';

// ============================================================================
// CREDENTIAL INPUTS
// ============================================================================

export type SecurityCredentialValueType = PropertyAuthoringRef;

export interface SecurityCredentialOptions extends DefinitionItem {
  readonly format?: SecurityCredentialFormat;
  readonly valueType?: SecurityCredentialValueType;
}

export interface SecurityCredentialInput extends DefinitionItem {
  readonly source: SecurityCredentialSource;
  readonly key: string;
  readonly format?: SecurityCredentialFormat;
  readonly valueType?: SecurityCredentialValueType;
}

export type SecurityCredentialInputMap = Record<string, SecurityCredentialInput>;

export interface SecurityCredentialsResult<TInput extends SecurityCredentialInputMap> {
  readonly credentials: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityCredentialAuthoringRef;
  };
}

// ============================================================================
// PRINCIPAL INPUTS
// ============================================================================

export type SecurityPrincipalInput = Record<string, EntityFieldAuthoringRef>;

export type SecurityPrincipalInputMap = Record<string, SecurityPrincipalInput>;

export interface SecurityPrincipalsResult<TInput extends SecurityPrincipalInputMap> {
  readonly principals: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityPrincipalAuthoringRef;
  };
}

// ============================================================================
// POLICY INPUTS
// ============================================================================

export type SecurityPrincipalRefMap = Record<string, SecurityPrincipalAuthoringRef>;

export interface SecurityRequirePolicyInput extends DefinitionItem {
  readonly credential?: SecurityCredentialAuthoringRef;
  readonly principals?: SecurityPrincipalRefMap;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly intent?: string;
}

export type SecurityPolicyInput = SecurityPolicyDefinition;

export type SecurityPolicyInputMap = Record<string, SecurityPolicyInput>;

export interface SecurityPoliciesResult<TInput extends SecurityPolicyInputMap> {
  readonly policies: TInput;

  readonly ref: {
    readonly [K in keyof TInput & string]: SecurityPolicyAuthoringRef;
  };
}

// ============================================================================
// SECURITY BUILDER
// ============================================================================

export interface SecurityBuilder {
  readonly state: Partial<SecurityDefinition>;

  header(key: string, options?: SecurityCredentialOptions): SecurityCredentialInput;

  cookie(key: string, options?: SecurityCredentialOptions): SecurityCredentialInput;

  query(key: string, options?: SecurityCredentialOptions): SecurityCredentialInput;

  bearerHeader(options?: Omit<SecurityCredentialOptions, 'format'>): SecurityCredentialInput;

  principal(fields: SecurityPrincipalInput): SecurityPrincipalInput;

  public(options?: DefinitionItem): SecurityPolicyInput;

  protected(options?: DefinitionItem): SecurityPolicyInput;

  require(input: SecurityRequirePolicyInput): SecurityPolicyInput;

  credentials<TInput extends SecurityCredentialInputMap>(credentials: TInput): SecurityCredentialsResult<TInput>;

  principals<TInput extends SecurityPrincipalInputMap>(principals: TInput): SecurityPrincipalsResult<TInput>;

  policies<TInput extends SecurityPolicyInputMap>(policies: TInput): SecurityPoliciesResult<TInput>;

  snapshot(): Partial<SecurityDefinition>;
}

export type RouteSecurityInput = SecurityPolicyAuthoringRef | SecurityPolicyInput;
export type RouteSecurityRefsInput = RouteSecurityInput;
