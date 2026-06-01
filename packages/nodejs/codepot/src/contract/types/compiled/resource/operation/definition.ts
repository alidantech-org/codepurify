import { Ref } from '../../ref';
import { DefinitionItem } from '../../definition';
import { DtoDefinition } from '../../schema/dto/definition';
import { ModelDefinition } from '../../schema/model/definition';
import { ParamsDefinition } from '../../schema/params/definition';

export interface OperationInputDefinition extends DefinitionItem {
  context?: Ref<DtoDefinition>[]; // injected request contexts (auth, tenant, etc.)
  params?: Ref<ParamsDefinition>; // path parameters schema
  query?: Ref<DtoDefinition | ModelDefinition>; // query string schema
  body?: Ref<DtoDefinition | ModelDefinition>; // request body schema
}

export interface OperationOutputDefinition extends DefinitionItem {
  result?: Ref<DtoDefinition | ModelDefinition>; // success payload schema
  errors?: Ref<DtoDefinition | ModelDefinition>[]; // typed error schemas (multiple possible)
}

export interface OperationDefinition extends DefinitionItem {
  input?: OperationInputDefinition;
  output?: OperationOutputDefinition;
}
