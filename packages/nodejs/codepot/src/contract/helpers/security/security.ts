import { ApiKeyLocation, SecurityAuthMode, SecuritySchemeType } from '@/contract/types/security/definition';

import type {
  RouteSecurityRefsInput,
  SecurityAuthHelper,
  SecurityAuthInput,
  SecurityContextHelper,
  SecurityGuardHelper,
  SecurityRoleSetHelper,
  SecurityRoleSourceHelper,
  SecurityRouteHelper,
  SecuritySchemeHelper,
} from '@/contract/types/core/9.security-builder';

// ============================================================================
// SCHEME HELPERS
// ============================================================================

export const securityScheme: SecuritySchemeHelper = {
  bearer(options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.http,
      scheme: 'bearer',
    };
  },

  bearerJwt(options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.http,
      scheme: 'bearer',
      bearerFormat: options.bearerFormat ?? 'JWT',
    };
  },

  basic(options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.http,
      scheme: 'basic',
    };
  },

  http(scheme, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.http,
      scheme,
    };
  },

  apiKey(keyName, location, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.apiKey,
      in: location,
      keyName,
    };
  },

  apiKeyHeader(keyName, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.apiKey,
      in: ApiKeyLocation.header,
      keyName,
    };
  },

  apiKeyQuery(keyName, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.apiKey,
      in: ApiKeyLocation.query,
      keyName,
    };
  },

  apiKeyCookie(keyName, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.apiKey,
      in: ApiKeyLocation.cookie,
      keyName,
    };
  },

  oauth2(flows, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.oauth2,
      flows,
    };
  },

  openId(openIdConnectUrl, options = {}) {
    return {
      ...options,
      type: SecuritySchemeType.openId,
      openIdConnectUrl,
    };
  },
};

// ============================================================================
// AUTH HELPERS
// ============================================================================

export const securityAuth: SecurityAuthHelper = {
  scheme(scheme, scopes) {
    return {
      scheme,
      scopes,
    };
  },

  any(schemes, options = {}) {
    return {
      ...options,
      mode: SecurityAuthMode.any,
      schemes,
    };
  },

  all(schemes, options = {}) {
    return {
      ...options,
      mode: SecurityAuthMode.all,
      schemes,
    };
  },
};

// ============================================================================
// CONTEXT HELPERS
// ============================================================================

export const securityContext: SecurityContextHelper = {
  dto(target, schema, options = {}) {
    return {
      ...options,
      target,
      schema,
    };
  },
};

// ============================================================================
// GUARD HELPERS
// ============================================================================

export const securityGuard: SecurityGuardHelper = {
  handler(handler, options = {}) {
    return {
      ...options,
      handler,
    };
  },
};

// ============================================================================
// ROLE HELPERS
// ============================================================================

export const securityRoleSource: SecurityRoleSourceHelper = {
  entityField(source, enumRef, options = {}) {
    return {
      ...options,
      source,
      enum: enumRef,
    };
  },
};

export const securityRoleSet: SecurityRoleSetHelper = {
  values(role, values, options = {}) {
    return {
      ...options,
      role,
      values,
    };
  },
};

// ============================================================================
// ROUTE / RESOURCE SECURITY USAGE HELPERS
// ============================================================================

function protectedSecurity(input: RouteSecurityRefsInput = {}) {
  return {
    ...input,
    protected: true,
  };
}

export const securityRoute: SecurityRouteHelper = {
  public(options = {}) {
    return {
      ...options,
      protected: false,
    };
  },

  protected(input = {}) {
    return protectedSecurity(input);
  },

  auth(auth, options = {}) {
    return protectedSecurity({
      ...options,
      auth,
    });
  },

  roles(roleSets, options = {}) {
    return protectedSecurity({
      ...options,
      roleSets,
    });
  },

  guards(guards, options = {}) {
    return protectedSecurity({
      ...options,
      guards,
    });
  },

  custom(input) {
    return input;
  },
};

// ============================================================================
// GROUPED EXPORT
// ============================================================================

export const security = {
  scheme: securityScheme,
  auth: securityAuth,
  context: securityContext,
  guard: securityGuard,
  roleSource: securityRoleSource,
  roleSet: securityRoleSet,
  route: securityRoute,
};
