import { Ref } from '../ref/definition';
import { RoutePathDefinition } from './route/definition';

export interface ResourceSecurityDefaultsDefinition<TAuth = unknown, TRoleSet = unknown, TGuard = unknown> {
  protected: boolean;

  auth?: Ref<TAuth>;

  roleSets?: Ref<TRoleSet>[];

  guards?: Ref<TGuard>[];

  metadata?: Record<string, unknown>;
}

export interface ResourceDefaultsDefinition<TAuth = unknown, TRoleSet = unknown, TGuard = unknown, TContentType = unknown> {
  security?: ResourceSecurityDefaultsDefinition<TAuth, TRoleSet, TGuard>;

  requestContentType?: Ref<TContentType>;

  metadata?: Record<string, unknown>;
}

export interface ResourceDefinition<
  TEntity = unknown,
  TRoutePath = RoutePathDefinition,
  TAuth = unknown,
  TRoleSet = unknown,
  TGuard = unknown,
  TContentType = unknown,
> {
  key: string;

  name: string;

  basePath: string;

  folders?: string[];

  entities?: Ref<TEntity>[];

  defaults?: ResourceDefaultsDefinition<TAuth, TRoleSet, TGuard, TContentType>;

  routes: Record<string, TRoutePath>;

  metadata?: Record<string, unknown>;
}
