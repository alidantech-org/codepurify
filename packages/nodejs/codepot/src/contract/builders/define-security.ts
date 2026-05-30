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

import type {
  SecurityAuthAuthoringRef,
  SecurityContextAuthoringRef,
  SecurityGuardAuthoringRef,
  SecurityRoleSetAuthoringRef,
  SecurityRoleSourceAuthoringRef,
  SecuritySchemeAuthoringRef,
} from '@/contract/types/core/3.authoring-ref';

import type {
  RouteSecurityInput,
  SecurityAuthInputMap,
  SecurityAuthResult,
  SecurityBuilder,
  SecurityContextInputMap,
  SecurityContextsResult,
  SecurityGuardInputMap,
  SecurityGuardsResult,
  SecurityRoleSetInputMap,
  SecurityRoleSetsResult,
  SecurityRoleSourceInputMap,
  SecurityRoleSourcesResult,
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

import {
  securityAuthRef,
  securityContextRef,
  securityGuardRef,
  securityRoleSetRef,
  securityRoleSourceRef,
  securitySchemeRef,
} from '@/contract/helpers/refs/authoring-ref-builder';

// ============================================================================
// OPTIONS
// ============================================================================

export interface DefineSecurityOptions {
  readonly state?: Partial<SecurityDefinition>;
  readonly initial?: Partial<SecurityDefinition>;
}

// ============================================================================
// STATE HELPERS
// ============================================================================

function createInitialState(initial?: Partial<SecurityDefinition>): Partial<SecurityDefinition> {
  return {
    schemes: initial?.schemes ?? {},
    auth: initial?.auth ?? {},
    roleSources: initial?.roleSources ?? {},
    roleSets: initial?.roleSets ?? {},
    contexts: initial?.contexts ?? {},
    guards: initial?.guards ?? {},
    defaults: initial?.defaults,
  };
}

function ensureState(state: Partial<SecurityDefinition>): Partial<SecurityDefinition> {
  state.schemes ??= {};
  state.auth ??= {};
  state.roleSources ??= {};
  state.roleSets ??= {};
  state.contexts ??= {};
  state.guards ??= {};

  return state;
}

function writeSchemes<TInput extends SecuritySchemeInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.schemes![key] = value as unknown as SecuritySchemeDefinition;
  }
}

function writeAuth<TInput extends SecurityAuthInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.auth![key] = value as unknown as SecurityAuthDefinition;
  }
}

function writeRoleSources<TInput extends SecurityRoleSourceInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.roleSources![key] = value as unknown as SecurityRoleSourceDefinition;
  }
}

function writeRoleSets<TInput extends SecurityRoleSetInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.roleSets![key] = value as unknown as SecurityRoleSetDefinition;
  }
}

function writeContexts<TInput extends SecurityContextInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.contexts![key] = value as unknown as SecurityContextDefinition;
  }
}

function writeGuards<TInput extends SecurityGuardInputMap>(state: Partial<SecurityDefinition>, input: TInput): void {
  for (const [key, value] of Object.entries(input) as [keyof TInput & string, TInput[keyof TInput & string]][]) {
    state.guards![key] = value as unknown as SecurityGuardDefinition;
  }
}

function createSchemeRefs<TInput extends SecuritySchemeInputMap>(input: TInput): Record<keyof TInput & string, SecuritySchemeAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecuritySchemeAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securitySchemeRef(key);
  }

  return refs;
}

function createAuthRefs<TInput extends SecurityAuthInputMap>(input: TInput): Record<keyof TInput & string, SecurityAuthAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecurityAuthAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securityAuthRef(key);
  }

  return refs;
}

function createRoleSourceRefs<TInput extends SecurityRoleSourceInputMap>(
  input: TInput,
): Record<keyof TInput & string, SecurityRoleSourceAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecurityRoleSourceAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securityRoleSourceRef(key);
  }

  return refs;
}

function createRoleSetRefs<TInput extends SecurityRoleSetInputMap>(
  input: TInput,
): Record<keyof TInput & string, SecurityRoleSetAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecurityRoleSetAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securityRoleSetRef(key);
  }

  return refs;
}

function createContextRefs<TInput extends SecurityContextInputMap>(
  input: TInput,
): Record<keyof TInput & string, SecurityContextAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecurityContextAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securityContextRef(key);
  }

  return refs;
}

function createGuardRefs<TInput extends SecurityGuardInputMap>(input: TInput): Record<keyof TInput & string, SecurityGuardAuthoringRef> {
  const refs = {} as Record<keyof TInput & string, SecurityGuardAuthoringRef>;

  for (const key of Object.keys(input) as Array<keyof TInput & string>) {
    refs[key] = securityGuardRef(key);
  }

  return refs;
}

// ============================================================================
// DEFINE SECURITY
// ============================================================================

export function defineSecurity(options: DefineSecurityOptions = {}): SecurityBuilder {
  const state = ensureState(options.state ?? createInitialState(options.initial));

  let defaults = state.defaults as RouteSecurityInput | undefined;

  function snapshot(): Partial<SecurityDefinition> {
    state.defaults = defaults as unknown as SecurityDefinition['defaults'];
    return state;
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

    defineSchemes<TInput extends SecuritySchemeInputMap>(input: TInput): SecuritySchemesResult<TInput> {
      writeSchemes(state, input);

      return {
        schemes: input,
        ref: createSchemeRefs(input) as SecuritySchemesResult<TInput>['ref'],
      };
    },

    defineAuth<TInput extends SecurityAuthInputMap>(input: TInput): SecurityAuthResult<TInput> {
      writeAuth(state, input);

      return {
        auth: input,
        ref: createAuthRefs(input) as SecurityAuthResult<TInput>['ref'],
      };
    },

    defineRoleSources<TInput extends SecurityRoleSourceInputMap>(input: TInput): SecurityRoleSourcesResult<TInput> {
      writeRoleSources(state, input);

      return {
        roleSources: input,
        ref: createRoleSourceRefs(input) as SecurityRoleSourcesResult<TInput>['ref'],
      };
    },

    defineRoleSets<TInput extends SecurityRoleSetInputMap>(input: TInput): SecurityRoleSetsResult<TInput> {
      writeRoleSets(state, input);

      return {
        roleSets: input,
        ref: createRoleSetRefs(input) as SecurityRoleSetsResult<TInput>['ref'],
      };
    },

    defineContexts<TInput extends SecurityContextInputMap>(input: TInput): SecurityContextsResult<TInput> {
      writeContexts(state, input);

      return {
        contexts: input,
        ref: createContextRefs(input) as SecurityContextsResult<TInput>['ref'],
      };
    },

    defineGuards<TInput extends SecurityGuardInputMap>(input: TInput): SecurityGuardsResult<TInput> {
      writeGuards(state, input);

      return {
        guards: input,
        ref: createGuardRefs(input) as SecurityGuardsResult<TInput>['ref'],
      };
    },

    setDefaults(nextDefaults) {
      defaults = nextDefaults;
      return builder;
    },

    snapshot,
  };

  return builder;
}
