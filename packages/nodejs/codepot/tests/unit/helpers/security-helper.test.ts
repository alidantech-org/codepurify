import { describe, expect, it } from 'vitest';

import {
  security,
} from '@/index';

import {
  ApiKeyLocation,
  SecurityAuthMode,
  SecuritySchemeType,
} from '@/contract/types/security/definition';

describe('security helpers', () => {
  it('creates bearer jwt scheme input', () => {
    expect(security.scheme.bearerJwt()).toEqual({
      type: SecuritySchemeType.http,
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  });

  it('creates api key header scheme input', () => {
    expect(security.scheme.apiKeyHeader('x-api-key')).toEqual({
      type: SecuritySchemeType.apiKey,
      in: ApiKeyLocation.header,
      keyName: 'x-api-key',
    });
  });

  it('creates auth input', () => {
    const scheme = {
      path: '#/security/schemes/bearer',
      kind: 'security.scheme',
      key: 'bearer',
      optional: undefined,
      required: undefined,
      nullable: undefined,
      nonNullable: undefined,
      array: undefined,
    } as never;

    const auth = security.auth.any([
      security.auth.scheme(scheme),
    ]);

    expect(auth.mode).toBe(SecurityAuthMode.any);
  });

  it('creates route security usage', () => {
    const authRef = {
      path: '#/security/auth/jwt',
      kind: 'security.auth',
      key: 'jwt',
    } as never;

    const routeSecurity = security.route.protected({
      auth: authRef,
    });

    expect(routeSecurity.protected).toBe(true);
    expect(routeSecurity.auth).toBe(authRef);
  });
});
