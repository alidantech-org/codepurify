// src/contract/builders/define-security.ts

import type {
  SecurityAuthDefinition,
  SecurityContextDefinition,
  SecurityDefinition,
  SecurityGuardDefinition,
  SecurityRoleSetDefinition,
  SecurityRoleSourceDefinition,
  SecuritySchemeDefinition,
} from '@/contract/types/security/definition';

import type { Ref } from '@/contract/types/ref';

import {
  AuthoringRefKind,
  type SecurityAuthAuthoringRef,
  type SecurityContextAuthoringRef,
  type SecurityGuardAuthoringRef,
  type SecurityRoleSetAuthoringRef,
  type SecurityRoleSourceAuthoringRef,
  type SecuritySchemeAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import type {
  RouteSecurityInput,
  SecurityAuthInput,
  SecurityAuthInputMap,
  SecurityAuthResult,
  SecurityBuilder,
  SecurityContextInput,
  SecurityContextInputMap,
  SecurityContextsResult,
  SecurityGuardInput,
  SecurityGuardInputMap,
  SecurityGuardsResult,
  SecurityRoleSetInput,
  SecurityRoleSetInputMap,
  SecurityRoleSetsResult,
  SecurityRoleSourceInput,
  SecurityRoleSourceInputMap,
  SecurityRoleSourcesResult,
  SecuritySchemeInput,
  SecuritySchemeInputMap,
  SecuritySchemesResult,
} from '@/contract/types/core/9.security-builder';

import {
  securityAuth,
  securityContext,
  securityGuard,
  securityRoleSet,
  securityRoleSource,
  securityRoute,
  securityScheme,
} from '@/contract/helpers/security/security';

import { createAuthoringRef, refPath } from '@/contract/helpers/refs/create-authoring-ref';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineSecurityOptions {
  readonly initial?: Partial<SecurityDefinition>;
}

// ============================================================================
// PATHS
// ============================================================================

function schemePath(key: string): Ref<SecuritySchemeDefinition> {
  return refPath<SecuritySchemeDefinition>(`#/security/schemes/${key}`);
}

function authPath(key: string): Ref<SecurityAuthDefinition> {
  return refPath<SecurityAuthDefinition>(`#/security/auth/${key}`);
}

function roleSourcePath(key: string): Ref<SecurityRoleSourceDefinition> {
  return refPath<SecurityRoleSourceDefinition>(`#/security/roleSources/${key}`);
}

function roleSetPath(key: string): Ref<SecurityRoleSetDefinition> {
  return refPath<SecurityRoleSetDefinition>(`#/security/roleSets/${key}`);
}

function contextPath(key: string): Ref<SecurityContextDefinition> {
  return refPath<SecurityContextDefinition>(`#/security/contexts/${key}`);
}

function guardPath(key: string): Ref<SecurityGuardDefinition> {
  return refPath<SecurityGuardDefinition>(`#/security/guards/${key}`);
}

// ============================================================================
// REFS
// ============================================================================

function createSchemeRef(key: string): SecuritySchemeAuthoringRef {
  return createAuthoringRef({
    path: schemePath(key),
    kind: AuthoringRefKind.securityScheme,
    key,
    name: key,
  });
}

function createAuthRef(key: string): SecurityAuthAuthoringRef {
  return createAuthoringRef({
    path: authPath(key),
    kind: AuthoringRefKind.securityAuth,
    key,
    name: key,
  });
}

function createRoleSourceRef(key: string): SecurityRoleSourceAuthoringRef {
  return createAuthoringRef({
    path: roleSourcePath(key),
    kind: AuthoringRefKind.securityRoleSource,
    key,
    name: key,
  });
}

function createRoleSetRef(key: string): SecurityRoleSetAuthoringRef {
  return createAuthoringRef({
    path: roleSetPath(key),
    kind: AuthoringRefKind.securityRoleSet,
    key,
    name: key,
  });
}

function createContextRef(key: string): SecurityContextAuthoringRef {
  return createAuthoringRef({
    path: contextPath(key),
    kind: AuthoringRefKind.securityContext,
    key,
    name: key,
  });
}

function createGuardRef(key: string): SecurityGuardAuthoringRef {
  return createAuthoringRef({
    path: guardPath(key),
    kind: AuthoringRefKind.securityGuard,
    key,
    name: key,
  });
}

// ============================================================================
// DEFINE SECURITY
// ============================================================================

export function defineSecurity(options: DefineSecurityOptions = {}): SecurityBuilder {
  const schemes: Record<string, SecuritySchemeInput> = {
    ...((options.initial?.schemes ?? {}) as unknown as Record<string, SecuritySchemeInput>),
  };

  const auth: Record<string, SecurityAuthInput> = {
    ...((options.initial?.auth ?? {}) as unknown as Record<string, SecurityAuthInput>),
  };

  const roleSources: Record<string, SecurityRoleSourceInput> = {
    ...((options.initial?.roleSources ?? {}) as unknown as Record<string, SecurityRoleSourceInput>),
  };

  const roleSets: Record<string, SecurityRoleSetInput> = {
    ...((options.initial?.roleSets ?? {}) as unknown as Record<string, SecurityRoleSetInput>),
  };

  const contexts: Record<string, SecurityContextInput> = {
    ...((options.initial?.contexts ?? {}) as unknown as Record<string, SecurityContextInput>),
  };

  const guards: Record<string, SecurityGuardInput> = {
    ...((options.initial?.guards ?? {}) as unknown as Record<string, SecurityGuardInput>),
  };

  let defaults = options.initial?.defaults as RouteSecurityInput | undefined;

  function snapshot(): Partial<SecurityDefinition> {
    return {
      schemes: schemes as unknown as Record<string, SecuritySchemeDefinition>,
      auth: auth as unknown as Record<string, SecurityAuthDefinition>,
      roleSources: roleSources as unknown as Record<string, SecurityRoleSourceDefinition>,
      roleSets: roleSets as unknown as Record<string, SecurityRoleSetDefinition>,
      contexts: contexts as unknown as Record<string, SecurityContextDefinition>,
      guards: guards as unknown as Record<string, SecurityGuardDefinition>,
      defaults: defaults as unknown as SecurityDefinition['defaults'],
    };
  }

  function defineSchemes<TInput extends SecuritySchemeInputMap>(input: TInput): SecuritySchemesResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecuritySchemeAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      schemes[key] = value;
      refs[key] = createSchemeRef(key);
    }

    return {
      schemes: input,
      ref: refs,
    };
  }

  function defineAuth<TInput extends SecurityAuthInputMap>(input: TInput): SecurityAuthResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecurityAuthAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      auth[key] = value;
      refs[key] = createAuthRef(key);
    }

    return {
      auth: input,
      ref: refs,
    };
  }

  function defineRoleSources<TInput extends SecurityRoleSourceInputMap>(input: TInput): SecurityRoleSourcesResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecurityRoleSourceAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      roleSources[key] = value;
      refs[key] = createRoleSourceRef(key);
    }

    return {
      roleSources: input,
      ref: refs,
    };
  }

  function defineRoleSets<TInput extends SecurityRoleSetInputMap>(input: TInput): SecurityRoleSetsResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecurityRoleSetAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      roleSets[key] = value;
      refs[key] = createRoleSetRef(key);
    }

    return {
      roleSets: input,
      ref: refs,
    };
  }

  function defineContexts<TInput extends SecurityContextInputMap>(input: TInput): SecurityContextsResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecurityContextAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      contexts[key] = value;
      refs[key] = createContextRef(key);
    }

    return {
      contexts: input,
      ref: refs,
    };
  }

  function defineGuards<TInput extends SecurityGuardInputMap>(input: TInput): SecurityGuardsResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecurityGuardAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      guards[key] = value;
      refs[key] = createGuardRef(key);
    }

    return {
      guards: input,
      ref: refs,
    };
  }

  const builder: SecurityBuilder = {
    get state() {
      return snapshot();
    },

    scheme: securityScheme,
    auth: securityAuth,
    context: securityContext,
    guard: securityGuard,
    roleSource: securityRoleSource,
    roleSet: securityRoleSet,
    route: securityRoute,

    defineSchemes,
    defineAuth,
    defineRoleSources,
    defineRoleSets,
    defineContexts,
    defineGuards,

    setDefaults(nextDefaults) {
      defaults = nextDefaults;
      return builder;
    },

    snapshot,
  };

  return builder;
}
