import { DtoDefinition } from './dto/definition';
import { EntityDefinition } from './entity/definition';
import { ModelDefinition } from './model/definition';
import { ParamsDefinition } from './params/definition';

export interface SchemasDefinition {
  /**
   * Entity schemas
   */
  entities: Record<string, EntityDefinition>;

  /**
   * Model schemas
   */
  models: Record<string, ModelDefinition>;

  /**
   * DTO schemas
   */
  dtos: Record<string, DtoDefinition>;

  /**
   * Params schemas
   */
  params: Record<string, ParamsDefinition>;
}

export type RefSchema = EntityDefinition | ModelDefinition | DtoDefinition | ParamsDefinition;
