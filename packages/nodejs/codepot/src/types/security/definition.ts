import { Ref } from '../ref/definition';

export interface SecurityRoleDefinition {
  ref: Ref;
}

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

export interface SecurityPolicyDefinition {
  description?: string;

  access?: AccessDefinition;

  metadata?: Record<string, unknown>;
}

export interface SecurityDefinition {
  roles: Record<string, SecurityRoleDefinition>;

  schemes: Record<string, SecuritySchemeDefinition>;

  policies?: Record<string, SecurityPolicyDefinition>;

  defaults?: AccessDefinition;
}

export type AccessLevel = 'public' | 'restricted' | 'secret';

export interface FieldAccessConfig {
  read?: AccessLevel;

  write?: AccessLevel;

  roles?: Ref[];

  metadata?: Record<string, unknown>;
}

export interface AccessDefinition {
  public?: boolean;

  roles?: Ref[];

  policies?: Ref[];

  metadata?: Record<string, unknown>;
}
