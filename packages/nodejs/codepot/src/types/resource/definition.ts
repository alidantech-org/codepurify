import { DefinitionItem } from '../definition';
import { Ref } from '../_shared/ref/definition';
import { EntityDefinition } from '../schema/entity/definition';
import { ResourceSecurityDefaultsDefinition } from '../security/definition';
import { RoutePathDefinition } from './route/definition';

export interface ResourceDefaultsDefinition extends DefinitionItem {
  security: ResourceSecurityDefaultsDefinition;
}

export interface ResourceDefinition extends DefinitionItem {
  name: string;

  folders: string[];

  entities: Ref<EntityDefinition>[];

  defaults: ResourceDefaultsDefinition;

  routes: Record<string, RoutePathDefinition>;
}
