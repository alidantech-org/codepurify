// src/contract/types/compiled/definition.ts

// ============================================================================
// ROOT
// ============================================================================

import type { ContentTypeDefinition } from './content/definition';
import type { InfoDefinition } from './info/definition';
import type { PropertiesDefinition } from './properties/definition';
import type { ResourceDefinition } from './resource/definition';
import type { ResponsesDefinition } from './response/definition';
import type { SchemasDefinition } from './schema/definition';
import type { SecurityDefinition } from './security/definition';
import type { UrlDefinition } from './url/definition';

// ============================================================================
// SHARED DEFINITION ITEM
// ============================================================================

export interface DefinitionItem {
  readonly meta?: Record<string, unknown>;
  readonly description?: string;
  readonly deprecated?: boolean;
}

// ============================================================================
// COMPILED CODEPOT DEFINITION
// ============================================================================

/**
 * Compiled Codepot IR/spec.
 *
 * This is the stable compiler output and the only contract shape codegen
 * should consume. Authoring-layer refs/helpers must not leak into this type.
 */
export interface CodepotDefinition extends DefinitionItem {
  /**
   * Codepot compiled IR/schema version.
   */
  readonly codepot: string;

  /**
   * Stable API/project key.
   * Compiler should normalize this to snake_case.
   */
  readonly key: string;

  /**
   * API major version.
   */
  readonly version: number;

  readonly info: InfoDefinition;

  readonly urls: readonly UrlDefinition[];

  /**
   * Reusable content type registry.
   */
  readonly content_types: Record<string, ContentTypeDefinition>;

  /**
   * Reusable low-level properties.
   */
  readonly properties: PropertiesDefinition;

  /**
   * Reusable schemas.
   */
  readonly schemas: SchemasDefinition;

  /**
   * Reusable response registry.
   */
  readonly responses: ResponsesDefinition;

  /**
   * API security registry.
   */
  readonly security: SecurityDefinition;

  /**
   * API resources.
   */
  readonly resources: Record<string, ResourceDefinition>;
}
