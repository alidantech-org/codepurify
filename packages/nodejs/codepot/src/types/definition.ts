// ============================================================================
// ROOT
// ============================================================================

import { InfoDefinition } from './info/definition';
import { PropertiesDefinition } from './properties/definition';
import { ResourceDefinition } from './resource/definition';
import { ResponsesDefinition } from './response/definition';
import { SchemasDefinition } from './schema/definition';
import { SecurityDefinition } from './security/definition';
import { UrlDefinition } from './url/definition';

export interface CodepotDefinition {
  /** Codepot IR/schema version */
  codepot: string;

  /** API/project key */
  key: string;

  /** API version */
  version: number;

  /** API information */
  info: InfoDefinition;

  /** API URLs */
  urls: UrlDefinition[];

  /** API security registry */
  security: SecurityDefinition;

  /** Reusable low-level properties */
  properties: PropertiesDefinition;

  /** Reusable schemas */
  schemas: SchemasDefinition;

  /** Reusable responses and default response map */
  responses: ResponsesDefinition;

  /** API resources */
  resources: Record<string, ResourceDefinition>;

  /** Extra extension data */
  meta: Record<string, unknown>;
}
