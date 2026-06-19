import type { ComponentRef } from '../refs/ref.types.js';
import type { RefWithUsageMethods } from '../refs/ref-usage.types.js';

export type AccessRoleMap = '*' | Record<string, true>;

export interface AccessDefinition {
  readonly context: RefWithUsageMethods<ComponentRef> | ComponentRef | null;
  readonly systemRoles?: AccessRoleMap;
  readonly tenantRoles?: AccessRoleMap;
  readonly tags?: readonly string[];
  readonly description?: string;
}

export interface AccessRef<TKey extends string = string> {
  readonly key: TKey;
  readonly name: TKey;
  readonly definition: AccessDefinition;
}

export type AccessRefMap<TInput extends Record<string, AccessDefinition>> = {
  readonly [Key in keyof TInput & string]: AccessRef<Key>;
};

export interface AccessRegistry<TInput extends Record<string, AccessDefinition> = Record<string, AccessDefinition>> {
  readonly definitions: readonly (AccessDefinition & { readonly key: keyof TInput & string })[];
  readonly ref: AccessRefMap<TInput>;
}
