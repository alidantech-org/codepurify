import type { ZodSourceRegistry } from '../zod/zod-source-registry.js';

export interface ResourceContext {
  readonly key: string;
  readonly name: string;
  readonly basePath: string;
  readonly tag: string;
  readonly group?: string;
}

export interface OptionalResourceContext {
  readonly resource?: ResourceContext;
  readonly zodRegistry?: ZodSourceRegistry;
}
