import { Ref } from '../ref/definition';
import { OperationDefinition } from './operation/definition';
import { RoutePathDefinition } from './route/definition';

export interface ResourceDefinition {
  basePath: string;

  entities?: Ref[];

  access?: AccessDefinition;

  operations?: Record<string, OperationDefinition>;

  routes?: Record<string, RoutePathDefinition>;

  metadata?: Record<string, unknown>;
}
