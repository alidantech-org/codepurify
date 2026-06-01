import { SecurityCredentialFormat, SecurityCredentialSource, SecurityPolicyMode } from '@/contract/types/compiled/security/definition';

import type {
  SecurityBuilder,
  SecurityCredentialOptions,
  SecurityCredentialInput,
  SecurityPrincipalInput,
  SecurityRequirePolicyInput,
  SecurityPolicyInput,
} from '@/contract/types/core/9.security-builder';

export function credential(
  source: SecurityCredentialSource,
  key: string,
  options: SecurityCredentialOptions = {},
): SecurityCredentialInput {
  return {
    ...options,
    source,
    key,
  };
}

export function header(key: string, options: SecurityCredentialOptions = {}): SecurityCredentialInput {
  return credential(SecurityCredentialSource.header, key, options);
}

export function cookie(key: string, options: SecurityCredentialOptions = {}): SecurityCredentialInput {
  return credential(SecurityCredentialSource.cookie, key, options);
}

export function query(key: string, options: SecurityCredentialOptions = {}): SecurityCredentialInput {
  return credential(SecurityCredentialSource.query, key, options);
}

export function bearerHeader(options: Omit<SecurityCredentialOptions, 'format'> = {}): SecurityCredentialInput {
  return header('authorization', {
    ...options,
    format: SecurityCredentialFormat.bearer,
  });
}

export function principal(fields: SecurityPrincipalInput): SecurityPrincipalInput {
  return fields;
}

export function publicPolicy(options = {}): SecurityPolicyInput {
  return {
    ...options,
    mode: SecurityPolicyMode.public,
  };
}

export function protectedPolicy(options = {}): SecurityPolicyInput {
  return {
    ...options,
    mode: SecurityPolicyMode.protected,
  };
}

export function requirePolicy(input: SecurityRequirePolicyInput): SecurityPolicyInput {
  return {
    ...input,
    mode: SecurityPolicyMode.protected,
  };
}

export const security = {
  public: publicPolicy,
  protected: protectedPolicy,
  require: requirePolicy,
};
