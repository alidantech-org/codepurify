import { DefinitionItem } from '../definition';
import { RoutePathDefinition } from './route/definition';
import { SecurityPolicyDefinition } from '../security/definition';
import { OperationDefinition } from './operation/definition';
import { ErrorsDefinition } from '../responses/errors/definition';

export interface ResourceDefinition extends DefinitionItem {
  folders: string[];
  defaults: {
    security: SecurityPolicyDefinition;
  };
  operations: Record<string, OperationDefinition>;
  routes: Record<string, RoutePathDefinition>;
  errors?: Partial<ErrorsDefinition>;
}
