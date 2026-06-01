// src/contract/types/compiled/resource/definition.ts

import type { DefinitionItem } from '../definition';
import type { Ref } from '../ref';
import type { SecurityPolicyDefinition } from '../security/definition';
import type { OperationDefinition } from './operation/definition';
import type { RoutesDefinition } from './route/definition';

// ============================================================================
// RESOURCE DEFAULTS
// ============================================================================

export interface ResourceDefaultsDefinition extends DefinitionItem {
  readonly security?: Ref<SecurityPolicyDefinition>;
}

// ============================================================================
// RESOURCE
// ============================================================================

export interface ResourceDefinition extends DefinitionItem {
  /**
   * Compiled URL base path.
   * Example: /users, /posts, /admin/users
   */
  readonly base_path: string;

  /**
   * Codegen/project organization folders.
   * These are not URL path segments.
   */
  readonly folders: readonly string[];

  readonly defaults: ResourceDefaultsDefinition;

  readonly operations: Record<string, OperationDefinition>;

  readonly routes: RoutesDefinition;
}
