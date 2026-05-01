import type { ParsedEntityField } from '../parser/entity-parser';
import type { ParsedEntityConfig } from '../parser/config-parser';
import { isPrimitiveType, isArrayType, isNullableType } from '../parser/field-parser';

/**
 * Field category for grouping
 */
export type FieldCategory = 'id' | 'audit' | 'relation' | 'primitive' | 'enum' | 'custom';

/**
 * Field context with metadata
 */
export interface FieldContext {
  /** Field name */
  name: string;
  /** Field type */
  type: string;
  /** Is field optional */
  optional: boolean;
  /** Is field readonly */
  readonly: boolean;
  /** Is field nullable */
  nullable: boolean;
  /** Is field array */
  array: boolean;
  /** Field category */
  category: FieldCategory;
  /** Is field a primary key */
  isPrimaryKey: boolean;
  /** Is field a foreign key */
  isForeignKey: boolean;
  /** Is field searchable */
  searchable: boolean;
  /** Is field sortable */
  sortable: boolean;
  /** Is field filterable */
  filterable: boolean;
  /** Is field immutable */
  immutable: boolean;
  /** Database column name */
  columnName: string;
  /** Database type */
  dbType: string;
}

/**
 * Field groups context
 */
export interface FieldGroupsContext {
  /** Primary key fields */
  primaryKeys: FieldContext[];
  /** Foreign key fields */
  foreignKeys: FieldContext[];
  /** Audit fields (created_at, updated_at, etc.) */
  auditFields: FieldContext[];
  /** Relation fields */
  relationFields: FieldContext[];
  /** Primitive fields */
  primitiveFields: FieldContext[];
  /** Enum fields */
  enumFields: FieldContext[];
  /** Custom fields */
  customFields: FieldContext[];
  /** All fields */
  all: FieldContext[];
}

/**
 * Field selection context
 */
export interface FieldSelectionContext {
  /** Default selectable fields */
  defaultSelect: string[];
  /** All selectable fields */
  selectable: string[];
  /** Sortable fields */
  sortable: string[];
  /** Filterable fields */
  filterable: string[];
  /** Searchable fields */
  searchable: string[];
  /** Date range fields */
  dateRange: string[];
}

/**
 * Field mutation context
 */
export interface FieldMutationContext {
  /** Creatable fields */
  creatable: string[];
  /** System creatable fields */
  systemCreatable: string[];
  /** Updatable fields */
  updatable: string[];
  /** Editable fields (creatable + updatable) */
  editable: string[];
  /** Read-only fields */
  readonly: string[];
  /** Immutable fields */
  immutable: string[];
}

/**
 * Complete fields context
 */
export interface FieldsContext {
  /** Field groups */
  groups: FieldGroupsContext;
  /** Field selection */
  selection: FieldSelectionContext;
  /** Field mutation */
  mutation: FieldMutationContext;
  /** Relation keys from config */
  relationKeys: string[];
}

/**
 * Determine field category
 *
 * @param field - Parsed field
 * @param config - Parsed config
 * @returns FieldCategory - Field category
 */
function determineFieldCategory(field: ParsedEntityField, config: ParsedEntityConfig): FieldCategory {
  const name = field.name.toLowerCase();
  const type = field.type.toLowerCase();

  // Primary key detection
  if (name === 'id' || name.endsWith('_id') || name.endsWith('id')) {
    return 'id';
  }

  // Audit field detection
  const auditFields = ['created_at', 'updated_at', 'deleted_at', 'createdby', 'updatedby', 'deletedby'];
  if (auditFields.includes(name)) {
    return 'audit';
  }

  // Relation field detection
  if (config.relationKeys.includes(field.name)) {
    return 'relation';
  }

  // Primitive type detection
  if (isPrimitiveType(field.type)) {
    return 'primitive';
  }

  // Enum detection (basic heuristic)
  if (type === type.toUpperCase() || type.endsWith('status') || type.endsWith('type') || type.endsWith('kind')) {
    return 'enum';
  }

  return 'custom';
}

/**
 * Determine if field is primary key
 *
 * @param field - Parsed field
 * @returns boolean - True if primary key
 */
function isPrimaryKey(field: ParsedEntityField): boolean {
  const name = field.name.toLowerCase();
  return name === 'id' || (name.endsWith('_id') && name !== 'created_by' && name !== 'updated_by');
}

/**
 * Determine if field is foreign key
 *
 * @param field - Parsed field
 * @param config - Parsed config
 * @returns boolean - True if foreign key
 */
function isForeignKey(field: ParsedEntityField, config: ParsedEntityConfig): boolean {
  return config.relationKeys.includes(field.name) && !isPrimaryKey(field);
}

/**
 * Determine database column name
 *
 * @param field - Parsed field
 * @returns string - Column name
 */
function determineColumnName(field: ParsedEntityField): string {
  const name = field.name;
  // Convert camelCase to snake_case
  return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * Determine database type
 *
 * @param field - Parsed field
 * @returns string - Database type
 */
function determineDbType(field: ParsedEntityField): string {
  const type = field.type.toLowerCase();

  // Map TypeScript types to database types
  const typeMap: Record<string, string> = {
    string: 'varchar(255)',
    number: 'numeric',
    boolean: 'boolean',
    date: 'timestamp',
    buffer: 'bytea',
    json: 'jsonb',
    uuid: 'uuid',
  };

  return typeMap[type] || 'varchar(255)';
}

/**
 * Determine field capabilities
 *
 * @param field - Parsed field
 * @returns Object with field capabilities
 */
function determineFieldCapabilities(field: ParsedEntityField) {
  const type = field.type.toLowerCase();
  const name = field.name.toLowerCase();

  return {
    searchable: type === 'string' && !name.endsWith('_id'),
    sortable: !isArrayType(field.type) && type !== 'json',
    filterable: !isArrayType(field.type) && type !== 'json',
  };
}

/**
 * Build field context from parsed field
 *
 * @param field - Parsed field
 * @param config - Parsed config
 * @returns FieldContext - Field context
 */
export function buildFieldContext(field: ParsedEntityField, config: ParsedEntityConfig): FieldContext {
  const category = determineFieldCategory(field, config);
  const capabilities = determineFieldCapabilities(field);
  const primaryKey = isPrimaryKey(field);

  return {
    name: field.name,
    type: field.type,
    optional: field.optional,
    readonly: field.readonly,
    nullable: field.nullable,
    array: field.array,
    category,
    isPrimaryKey: primaryKey,
    isForeignKey: isForeignKey(field, config),
    searchable: capabilities.searchable,
    sortable: capabilities.sortable,
    filterable: capabilities.filterable,
    immutable: primaryKey || field.readonly,
    columnName: determineColumnName(field),
    dbType: determineDbType(field),
  };
}

/**
 * Build field groups context
 *
 * @param fields - Array of field contexts
 * @returns FieldGroupsContext - Field groups
 */
export function buildFieldGroupsContext(fields: FieldContext[]): FieldGroupsContext {
  const groups: FieldGroupsContext = {
    primaryKeys: [],
    foreignKeys: [],
    auditFields: [],
    relationFields: [],
    primitiveFields: [],
    enumFields: [],
    customFields: [],
    all: fields,
  };

  for (const field of fields) {
    switch (field.category) {
      case 'id':
        groups.primaryKeys.push(field);
        break;
      case 'audit':
        groups.auditFields.push(field);
        break;
      case 'relation':
        groups.relationFields.push(field);
        break;
      case 'primitive':
        groups.primitiveFields.push(field);
        break;
      case 'enum':
        groups.enumFields.push(field);
        break;
      case 'custom':
        groups.customFields.push(field);
        break;
    }

    // Also categorize by key types
    if (field.isPrimaryKey) {
      groups.primaryKeys.push(field);
    }
    if (field.isForeignKey) {
      groups.foreignKeys.push(field);
    }
  }

  return groups;
}

/**
 * Build field selection context
 *
 * @param groups - Field groups
 * @returns FieldSelectionContext - Field selection
 */
export function buildFieldSelectionContext(groups: FieldGroupsContext): FieldSelectionContext {
  const allFieldNames = groups.all.map((f) => f.name);
  const primitiveFieldNames = groups.primitiveFields.map((f) => f.name);
  const searchableFields = groups.all.filter((f) => f.searchable).map((f) => f.name);
  const sortableFields = groups.all.filter((f) => f.sortable).map((f) => f.name);
  const filterableFields = groups.all.filter((f) => f.filterable).map((f) => f.name);
  const dateFields = groups.all.filter((f) => f.type.toLowerCase() === 'date').map((f) => f.name);

  // Default select: primary keys + non-relation primitives
  const defaultSelect = [
    ...groups.primaryKeys.map((f) => f.name),
    ...primitiveFieldNames.filter((name) => !groups.relationFields.some((rf) => rf.name === name)),
  ];

  return {
    defaultSelect,
    selectable: allFieldNames,
    sortable: sortableFields,
    filterable: filterableFields,
    searchable: searchableFields,
    dateRange: dateFields,
  };
}

/**
 * Build field mutation context
 *
 * @param groups - Field groups
 * @returns FieldMutationContext - Field mutation
 */
export function buildFieldMutationContext(groups: FieldGroupsContext): FieldMutationContext {
  const allFieldNames = groups.all.map((f) => f.name);
  const nonSystemFields = groups.all.filter((f) => f.category !== 'id' && f.category !== 'audit' && !f.readonly).map((f) => f.name);

  const updatableFields = groups.all
    .filter((f) => f.category !== 'id' && f.category !== 'audit' && !f.readonly && !f.immutable)
    .map((f) => f.name);

  return {
    creatable: nonSystemFields,
    systemCreatable: allFieldNames,
    updatable: updatableFields,
    editable: [...new Set([...nonSystemFields, ...updatableFields])],
    readonly: groups.all.filter((f) => f.readonly).map((f) => f.name),
    immutable: groups.all.filter((f) => f.immutable || f.category === 'id').map((f) => f.name),
  };
}

/**
 * Build complete fields context
 *
 * @param fields - Parsed fields
 * @param config - Parsed config
 * @returns FieldsContext - Complete fields context
 */
export function buildFieldsContext(fields: ParsedEntityField[], config: ParsedEntityConfig): FieldsContext {
  // Build field contexts
  const fieldContexts = fields.map((field) => buildFieldContext(field, config));

  // Build groups
  const groups = buildFieldGroupsContext(fieldContexts);

  // Build selection context
  const selection = buildFieldSelectionContext(groups);

  // Build mutation context
  const mutation = buildFieldMutationContext(groups);

  return {
    groups,
    selection,
    mutation,
    relationKeys: config.relationKeys,
  };
}
