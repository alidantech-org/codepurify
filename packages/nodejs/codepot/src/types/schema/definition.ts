import { EntityDefinition } from './entity/definition';
import { ModelDefinition } from './model/definition';
import { DtoDefinition } from './dto/definition';

export interface SchemasDefinition {
  entities: Record<string, EntityDefinition>;
  models: Record<string, ModelDefinition>;
  dtos: Record<string, DtoDefinition>;
}
