import { describe, expect, it } from 'vitest';

import { defineSecurity } from '@/index';

describe('defineSecurity', () => {
  it('registers schemes and auth refs', () => {
    const security = defineSecurity();

    const schemes = security.defineSchemes({
      bearer: security.scheme.bearerJwt(),
    });

    const auth = security.defineAuth({
      jwt: security.auth.any([
        security.auth.scheme(schemes.ref.bearer),
      ]),
    });

    expect(schemes.ref.bearer.kind).toBe('security.scheme');
    expect(auth.ref.jwt.kind).toBe('security.auth');
    expect(security.snapshot().schemes?.bearer).toBeDefined();
    expect(security.snapshot().auth?.jwt).toBeDefined();
  });
});
