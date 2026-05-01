/**
 * Tempurify template context registry.
 *
 * This file merges all chunked context registry sections into one canonical
 * registry object. It intentionally contains no helper methods.
 */
import { project_context } from './global/project.context';
import { discovery_context } from './global/discovery.context';
import { templates_context } from './template/templates.context';
import { paths_context } from './global/paths.context';
import { entity_context } from './entity/entity.context';
import { fields_context } from './entity/field_group.context';
import { field_context } from './entity/entity_field.context';
import { db_context } from './database/database.context';
import { relation_context } from './entity/relation.context';
import { index_context } from './index.context';
import { check_context } from './validation/check.context';
import { generated_types_context } from './output/generated_types.context';
import { generated_constants_context } from './output/generated_constants.context';
import { imports_context } from './import/imports.context';
import { output_context } from './output/output.context';

export const TEMPURIFY_VARIABLE_REGISTRY = {
  ...project_context,
  ...discovery_context,
  ...templates_context,
  ...paths_context,
  ...entity_context,
  ...fields_context,
  ...field_context,
  ...db_context,
  ...relation_context,
  ...index_context,
  ...check_context,
  ...generated_types_context,
  ...generated_constants_context,
  ...imports_context,
  ...output_context,
} as const;

export type TempurifyVariableRegistry = typeof TEMPURIFY_VARIABLE_REGISTRY;
export type TempurifyVariableRegistryGroup = keyof TempurifyVariableRegistry;
