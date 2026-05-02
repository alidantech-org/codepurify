/**
 * Tempurify template context registry.
 *
 * This file merges all chunked context registry sections into one canonical
 * registry object. It intentionally contains no helper methods.
 */
import { discovery_context } from './global.context';
import { entity_context } from './entity/entity.context';
import { fields_context } from './entity/field_group.context';
import { field_context } from './entity/entity_field.context';
import { relation_context } from './entity/relation.context';
import { generated_types_context } from './entity/generated_types.context';
import { generated_constants_context } from './entity/generated_constants.context';
import { imports_context } from './entity/paths.context';

export const TEMPURIFY_VARIABLE_REGISTRY = {
  ...discovery_context,
  ...entity_context,
  ...fields_context,
  ...field_context,
  ...relation_context,
  ...generated_types_context,
  ...generated_constants_context,
  ...imports_context,
} as const;

export type TempurifyVariableRegistry = typeof TEMPURIFY_VARIABLE_REGISTRY;
export type TempurifyVariableRegistryGroup = keyof TempurifyVariableRegistry;

