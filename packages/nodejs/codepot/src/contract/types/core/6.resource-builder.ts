import type { DefinitionItem } from '@/contract/types/definition';

import type { PropertiesDefinition } from '@/contract/types/properties/definition';
import type { ResourceDefinition } from '@/contract/types/resource/definition';
import type { OperationDefinition } from '@/contract/types/resource/operation/definition';
import type { RoutePathDefinition, RoutesDefinition } from '@/contract/types/resource/route/definition';
import type { SchemasDefinition } from '@/contract/types/schema/definition';

import type { ResourceAuthoringRef } from './3.authoring-ref';
import type { PropertiesBuilder } from './4.properties-builder';
import type { SchemasBuilder } from './5.schemas-builder';
import type { RoutesBuilder } from './7.routes-builder';
import type { RouteSecurityInput, RouteSecurityRefsInput, SecurityRouteHelper } from './9.security-builder';

// ============================================================================
// DEFINE RESOURCE OPTIONS
// ============================================================================

export interface DefineResourceOptions extends DefinitionItem {
  /**
   * Stable resource key.
   * Example: "users", "vehicle_brands", "auth_sessions"
   */
  readonly key: string;

  /**
   * Generated/code organization folders.
   * This is not a URL path.
   *
   * Example:
   * ["platform", "auth"]
   */
  readonly folders?: readonly string[];

  /**
   * Resource-level default security.
   * Applied to routes unless route-level security overrides it.
   */
  readonly security?: RouteSecurityInput;

  /**
   * Other resource-level default behavior.
   */
  readonly defaults?: Partial<Omit<ResourceDefinition['defaults'], 'security'>>;
}

// ============================================================================
// RESOURCE AUTHORING STATE
// ============================================================================

export interface ResourceAuthoringState extends DefinitionItem {
  readonly key: string;

  readonly folders: readonly string[];

  readonly defaults: {
    readonly security?: RouteSecurityInput;
  };

  readonly properties: Partial<PropertiesDefinition>;

  /**
   * Resource-scoped schemas:
   * entities, DTOs, params, model overrides, field-set overrides.
   */
  readonly schemas: Partial<SchemasDefinition>;

  readonly operations: Record<string, OperationDefinition>;

  readonly routes: RoutesDefinition;
}

// ============================================================================
// RESOURCE BUILDER
// ============================================================================

export interface ResourceBuilder {
  readonly state: ResourceAuthoringState;

  /**
   * Resource authoring ref.
   */
  readonly ref: ResourceAuthoringRef;

  /**
   * Security convenience helpers.
   *
   * Same helper family as version.defineSecurity().route.
   */
  readonly security: SecurityRouteHelper;

  /**
   * Resource-scoped reusable property sources:
   * primitives, enums, composites, and refs.
   */
  defineProperties(): PropertiesBuilder;

  /**
   * Resource-scoped schemas:
   * entities, DTOs, params, model overrides, field-set overrides.
   */
  defineSchemas(): SchemasBuilder;

  /**
   * Resource-scoped routes and operations.
   */
  defineRoutes(): RoutesBuilder;

  /**
   * Set/replace resource-level default security.
   */
  setSecurity(security: RouteSecurityInput): ResourceBuilder;

  /**
   * Mark the whole resource public by default.
   */
  public(): ResourceBuilder;

  /**
   * Mark the whole resource protected by default.
   */
  protected(input?: RouteSecurityRefsInput): ResourceBuilder;

  /**
   * Adds/preloads route data while route helpers are incomplete.
   */
  addRoute(key: string, route: RoutePathDefinition): ResourceBuilder;

  /**
   * Adds/preloads operation data while route helpers are incomplete.
   */
  addOperation(key: string, operation: OperationDefinition): ResourceBuilder;

  /**
   * Resource authoring snapshot.
   * Compiler later normalizes this into ResourceDefinition.
   */
  snapshot(): ResourceAuthoringState;
}
