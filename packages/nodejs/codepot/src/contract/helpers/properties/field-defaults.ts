import {
  FieldPersistenceMode,
  type FieldCapabilityConfig,
  type FieldLifecycleConfig,
  type FieldPersistenceConfig,
  type FieldVisibilityConfig,
} from '@/contract/types/schema/entity/field/definition';

import {
  PropertySlotSourceMode,
  EntityRelationKind,
  type EntityFieldInput,
  type EntityFieldOptions,
} from '@/contract/types/core/4.properties-builder';

function isRelation(field: EntityFieldInput): boolean {
  return field.source.mode === PropertySlotSourceMode.relation;
}

function relationDefaultsToArray(field: EntityFieldInput): boolean {
  if (field.source.mode !== PropertySlotSourceMode.relation) return false;

  return field.source.relation === EntityRelationKind.hasMany || field.source.relation === EntityRelationKind.manyToMany;
}

function hasKeys(value: object): boolean {
  return Object.keys(value).length > 0;
}

function normalizeVisibility(options: EntityFieldOptions): FieldVisibilityConfig {
  return {
    read: options.visibility?.read ?? 'internal',
    ...(options.visibility?.sensitive !== undefined ? { sensitive: options.visibility.sensitive } : {}),
  };
}

function normalizeCapability(options: EntityFieldOptions): FieldCapabilityConfig | undefined {
  const capability = options.capability ?? {};

  return hasKeys(capability) ? capability : undefined;
}

function normalizeLifecycle(options: EntityFieldOptions): FieldLifecycleConfig | undefined {
  const lifecycle = options.lifecycle ?? {};

  return hasKeys(lifecycle) ? lifecycle : undefined;
}

function normalizePersistence(field: EntityFieldInput, options: EntityFieldOptions): FieldPersistenceConfig {
  return {
    mode: options.persistence?.mode ?? (isRelation(field) ? FieldPersistenceMode.virtual : FieldPersistenceMode.stored),

    ...(options.persistence?.generated !== undefined ? { generated: options.persistence.generated } : {}),

    ...(options.persistence?.immutable !== undefined ? { immutable: options.persistence.immutable } : {}),
  };
}

export function normalizeEntityFieldOptions(field: EntityFieldInput): EntityFieldOptions {
  const options = field.options ?? {};
  const normalized: EntityFieldOptions = {
    ...options,

    required: options.required ?? true,

    visibility: normalizeVisibility(options),

    persistence: normalizePersistence(field, options),

    ...(options.nullable !== undefined ? { nullable: options.nullable } : {}),

    ...(options.array !== undefined ? { array: options.array } : relationDefaultsToArray(field) ? { array: true } : {}),

    ...(normalizeCapability(options) !== undefined ? { capability: normalizeCapability(options) } : {}),

    ...(normalizeLifecycle(options) !== undefined ? { lifecycle: normalizeLifecycle(options) } : {}),
  };

  return normalized;
}
