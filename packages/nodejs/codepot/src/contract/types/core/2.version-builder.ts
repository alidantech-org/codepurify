import type { InfoDefinition } from '@/contract/types/compiled/info/definition';
import type { UrlDefinition } from '@/contract/types/compiled/url/definition';
import type { SecurityDefinition } from '@/contract/types/compiled/security/definition';
import type { ErrorsDefinition } from '@/contract/types/compiled/responses/errors/definition';
import type { PropertiesDefinition } from '@/contract/types/compiled/properties/definition';
import type { SchemasDefinition } from '@/contract/types/compiled/schema/definition';
import type { ResourceDefinition } from '@/contract/types/compiled/resource/definition';

import type { PropertiesBuilder } from './4.properties-builder';
import type { SchemasBuilder } from './5.schemas-builder';
import type { DefineResourceOptions, ResourceBuilder } from './6.resource-builder';
import type { ErrorInputMap, ErrorsResult } from './8.errors-builder';
import type { SecurityBuilder } from './9.security-builder';

export interface DefineVersionContractOptions {
  /**
   * Codepot IR/schema version.
   * Example: "1.0"
   */
  readonly codepot?: string;

  /**
   * Stable API/project key.
   * Example: "riderescue_api"
   */
  readonly key: string;

  /**
   * API major version.
   * Example: 1
   */
  readonly version: number;

  readonly info: InfoDefinition;

  readonly urls?: readonly UrlDefinition[];

  /**
   * Optional prebuilt authoring sections.
   * Useful while some authoring helpers are not implemented yet.
   */
  readonly properties?: Partial<PropertiesDefinition>;
  readonly schemas?: Partial<SchemasDefinition>;
  readonly errors?: Partial<ErrorsDefinition>;
  readonly security?: Partial<SecurityDefinition>;
  readonly resources?: Record<string, ResourceDefinition>;

  readonly meta?: Record<string, unknown>;
  readonly description?: string;
  readonly deprecated?: boolean;
}

export interface VersionAuthoringState {
  readonly codepot: string;
  readonly key: string;
  readonly version: number;
  readonly info: InfoDefinition;
  readonly urls: readonly UrlDefinition[];

  readonly properties: Partial<PropertiesDefinition>;
  readonly schemas: Partial<SchemasDefinition>;
  readonly errors: Partial<ErrorsDefinition>;
  readonly security: Partial<SecurityDefinition>;
  readonly resources: Record<string, ResourceDefinition>;

  readonly meta?: Record<string, unknown>;
  readonly description?: string;
  readonly deprecated?: boolean;
}

export interface VersionBuilder {
  /**
   * Current authoring state.
   * Compiler later normalizes this into final Codepot IR.
   */
  readonly state: VersionAuthoringState;

  /**
   * Version-level reusable property sources:
   * primitives, enums, composites, and reusable refs.
   */
  defineProperties(): PropertiesBuilder;

  /**
   * Version-level schemas:
   * entities, DTOs, params, model overrides, field-set overrides.
   */
  defineSchemas(): SchemasBuilder;

  /**
   * Version-level reusable API errors.
   */
  defineErrors<TInput extends ErrorInputMap>(input: TInput): ErrorsResult<TInput>;

  /**
   * Version-level security intent metadata:
   * credentials, principals, and policies.
   */
  defineSecurity(): SecurityBuilder;

  /**
   * Resource authoring entry.
   */
  defineResource(options: DefineResourceOptions): ResourceBuilder;

  /**
   * Allows adding a prebuilt resource while helpers are incomplete.
   */
  addResource(key: string, resource: ResourceDefinition): VersionBuilder;

  /**
   * Allows adding/preloading properties while helpers are incomplete.
   */
  addProperties(properties: Partial<PropertiesDefinition>): VersionBuilder;

  /**
   * Allows adding/preloading schemas while helpers are incomplete.
   */
  addSchemas(schemas: Partial<SchemasDefinition>): VersionBuilder;

  /**
   * Allows adding/preloading reusable errors while helpers are incomplete.
   */
  addErrors(errors: Partial<ErrorsDefinition>): VersionBuilder;

  /**
   * Allows adding/preloading security while helpers are incomplete.
   */
  addSecurity(security: Partial<SecurityDefinition>): VersionBuilder;

  /**
   * Authoring snapshot.
   * This is still authoring state, not final compiled Codepot IR.
   */
  snapshot(): VersionAuthoringState;
}
