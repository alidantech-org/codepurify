// ============================================================================
// ROOT
// ============================================================================

import { InfoDefinition } from './info/definition';
import { PropertiesDefinition } from './properties/definition';
import { ResourceDefinition } from './resource/definition';
import { TransportDefinition } from './transport/definition';
import { SchemasDefinition } from './schema/definition';
import { SecurityDefinition } from './security/definition';
import { UrlDefinition } from './url/definition';

export interface DefinitionItem {
  meta?: Record<string, unknown>;
  description?: string;
  deprecated?: boolean;
}

export interface CodepotDefinition extends DefinitionItem {
  /**1. 🍲 Codepot IR/schema version  */
  codepot: string;

  /**2. 🗝️ API/project key use snake_case for clean wording */
  key: string;

  /**3. 📊 API version */
  version: number;

  /**4. 📝 API information */
  info: InfoDefinition;

  /**5. 🌐 API URLs */
  urls: UrlDefinition[];

  /**6. 🧩 Reusable low-level properties */
  properties: PropertiesDefinition;

  /**7. 🧩 Reusable schemas */
  schemas: SchemasDefinition;

  /**8. 🔄 Reusable responses and default response map  */
  transport: TransportDefinition;

  /**9. 🔐 API security registry */
  security: SecurityDefinition;

  /**10. 📦 API resources -- progress 👈 we are here  */
  resources: Record<string, ResourceDefinition>;
}
