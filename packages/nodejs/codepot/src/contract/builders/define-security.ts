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

import { isAuthoringRef, isRefUsage, normalizeRefOrUsagePlain } from '@/pipeline/compiler/refs/normalize-ref-usage';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineSecurityOptions {
  readonly state?: Partial<SecurityDefinition>;
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
// NORMALIZATION
// ============================================================================

function normalizeSecuritySchemeInput(input: SecuritySchemeInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
  };
}

function normalizeSecurityAuthInput(input: SecurityAuthInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  const normalized: Record<string, unknown> = {
    ...obj,
  };

  if (obj.schemes && Array.isArray(obj.schemes)) {
    normalized.schemes = obj.schemes.map((scheme: unknown) => {
      if (isAuthoringRef(scheme) || isRefUsage(scheme)) {
        return normalizeRefOrUsagePlain(scheme);
      }
      return scheme;
    });
  }

  return normalized;
}

function normalizeSecurityRoleSourceInput(input: SecurityRoleSourceInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
  };
}

function normalizeSecurityRoleSetInput(input: SecurityRoleSetInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  const normalized: Record<string, unknown> = {
    ...obj,
  };

  if (obj.roles && Array.isArray(obj.roles)) {
    normalized.roles = obj.roles.map((role: unknown) => {
      if (isAuthoringRef(role) || isRefUsage(role)) {
        return normalizeRefOrUsagePlain(role);
      }
      return role;
    });
  }

  return normalized;
}

function normalizeSecurityContextInput(input: SecurityContextInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
  };
}

function normalizeSecurityGuardInput(input: SecurityGuardInput): unknown {
  const obj = input as unknown as Record<string, unknown>;
  return {
    ...obj,
  };
}

// ============================================================================
// DEFINE SECURITY
// ============================================================================

export function defineSecurity(options: DefineSecurityOptions = {}): SecurityBuilder {
  const state = options.state ?? {
    schemes: options.initial?.schemes ?? {},
    auth: options.initial?.auth ?? {},
    roleSources: options.initial?.roleSources ?? {},
    roleSets: options.initial?.roleSets ?? {},
    contexts: options.initial?.contexts ?? {},
    guards: options.initial?.guards ?? {},
    defaults: options.initial?.defaults,
  };

  state.schemes ??= {};
  state.auth ??= {};
  state.roleSources ??= {};
  state.roleSets ??= {};
  state.contexts ??= {};
  state.guards ??= {};

  let defaults = state.defaults as RouteSecurityInput | undefined;

  function snapshot(): Partial<SecurityDefinition> {
    state.defaults = defaults as unknown as SecurityDefinition['defaults'];
    return state;
  }

  function defineSchemes<TInput extends SecuritySchemeInputMap>(input: TInput): SecuritySchemesResult<TInput> {
    const refs = {} as {
      [K in keyof TInput & string]: SecuritySchemeAuthoringRef;
    };

    for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
      state.schemes![key] = normalizeSecuritySchemeInput(value) as SecuritySchemeDefinition;
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
      state.auth![key] = normalizeSecurityAuthInput(value) as SecurityAuthDefinition;
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
      state.roleSources![key] = normalizeSecurityRoleSourceInput(value) as SecurityRoleSourceDefinition;
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
      state.roleSets![key] = normalizeSecurityRoleSetInput(value) as SecurityRoleSetDefinition;
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
      state.contexts![key] = normalizeSecurityContextInput(value) as SecurityContextDefinition;
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
      state.guards![key] = normalizeSecurityGuardInput(value) as SecurityGuardDefinition;
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
