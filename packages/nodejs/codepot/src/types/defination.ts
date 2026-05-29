// ============================================================================
// ROOT
// ============================================================================

import { PropertiesDefinition } from './properties/definition';
import { ResourceDefinition } from './resource/definition';
import { ResponseDefinition } from './response/definition';
import { SchemasDefinition } from './schema/definition';
import { SecurityDefinition } from './security/definition';
import { InfoDefinition } from './info/definition';
import { UrlDefinition } from './url/definition';

export interface CodepotDefinition {
  /** Codepot version */
  codepot: string; // ✅

  /** API version */
  version: number; // ✅

  /** API information */
  info: InfoDefinition; // ✅

  /** API URLs */
  urls: UrlDefinition[]; // ✅

  /** API security */
  security: SecurityDefinition; // ❌ -- inprogress

  /** API properties */
  properties: PropertiesDefinition; // ❌ -- pending

  /** API schemas */
  schemas: SchemasDefinition; // ❌ -- pending

  /** API responses */
  responses: Record<string, ResponseDefinition>; // ❌ -- pending

  /** API resources */
  resources: Record<string, ResourceDefinition>; // ❌ -- pending
}
