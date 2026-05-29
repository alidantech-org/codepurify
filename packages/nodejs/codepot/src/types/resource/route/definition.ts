import { Ref } from '../../ref/definition';

export interface RouteMethodDefinition {
  operation: Ref;

  summary?: string;

  description?: string;

  // access?: AccessDefinition;

  metadata?: Record<string, unknown>;
}

export interface RoutePathDefinition {
  parameters?: Record<string, Ref>;

  get?: RouteMethodDefinition;

  post?: RouteMethodDefinition;

  put?: RouteMethodDefinition;

  patch?: RouteMethodDefinition;

  delete?: RouteMethodDefinition;

  options?: RouteMethodDefinition;

  head?: RouteMethodDefinition;
}
