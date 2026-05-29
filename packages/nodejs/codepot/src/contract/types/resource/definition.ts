import { DefinitionItem } from '../definition';
import { RoutePathDefinition } from './route/definition';
import { RouteSecurityDefinition } from '../security/definition';
import { OperationDefinition } from './operation/definition';

export interface ResourceDefinition extends DefinitionItem {
  folders: string[];
  defaults: {
    security: RouteSecurityDefinition;
  };
  operations: Record<string, OperationDefinition>;
  routes: Record<string, RoutePathDefinition>;
}
