import { DtoDefinition } from './dto/definition';
import { EntityDefinition } from './entity/definition';
import { ModelDefinition } from './model/definition';
import { ParamsDefinition } from './params/definition';

export interface SchemasDefinition {
  entities: Record<string, EntityDefinition>;

  models: Record<string, ModelDefinition>;

  dtos: Record<string, DtoDefinition>;

  params: Record<string, ParamsDefinition>;
}

export type RefSchema = EntityDefinition | ModelDefinition | DtoDefinition | ParamsDefinition;
