import type { ParsedEntityRelation } from '../parser/entity-parser';
import type { ParsedEntityConfig } from '../parser/config-parser';
import { inferRelationKindWithContext, InferredRelation } from '../parser/relation-parser';
import type { FieldContext } from './field-context';
import { createNameVariants } from '../../../utils/case';

/**
 * Enhanced relation context with full metadata
 */
export interface RelationContext {
  /** Relation name */
  name: string;
  /** Target entity type */
  targetType: string;
  /** Target entity name variants */
  targetNames: {
    pascal: string;
    camel: string;
    kebab: string;
    snake: string;
    screamingSnake: string;
    plural: string;
    singular: string;
  };
  /** Relation type */
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | 'unknown';
  /** Inference confidence */
  confidence: number;
  /** Inference reasoning */
  reasoning: string;
  /** Is array relation */
  isArray: boolean;
  /** Is nullable relation */
  isNullable: boolean;
  /** Is readonly relation */
  isReadonly: boolean;
  /** Join column name */
  joinColumn?: string;
  /** Inverse join column name */
  inverseJoinColumn?: string;
  /** Join table name */
  joinTable?: string;
  /** Target field name */
  targetField?: string;
  /** Inverse relation name */
  inverseRelation?: string;
}

/**
 * Relation groups context
 */
export interface RelationGroupsContext {
  /** One-to-one relations */
  oneToOne: RelationContext[];
  /** One-to-many relations */
  oneToMany: RelationContext[];
  /** Many-to-one relations */
  manyToOne: RelationContext[];
  /** Many-to-many relations */
  manyToMany: RelationContext[];
  /** Unknown relations */
  unknown: RelationContext[];
  /** All relations */
  all: RelationContext[];
}

/**
 * Relation query context
 */
export interface RelationQueryContext {
  /** As one relation query types */
  asOneQueries: Array<{
    relationName: string;
    typeName: string;
    targetType: string;
  }>;
  /** As many relation query types */
  asManyQueries: Array<{
    relationName: string;
    typeName: string;
    targetType: string;
  }>;
}

/**
 * Relation map context
 */
export interface RelationMapContext {
  /** Entity relations map */
  entityRelations: Record<string, RelationContext>;
  /** Relation targets map */
  relationTargets: Record<string, string>;
  /** Relation fields map */
  relationFields: Record<string, string>;
}

/**
 * Complete relations context
 */
export interface RelationsContext {
  /** Relation groups */
  groups: RelationGroupsContext;
  /** Relation queries */
  queries: RelationQueryContext;
  /** Relation maps */
  maps: RelationMapContext;
  /** Relation keys from config */
  relationKeys: string[];
}

/**
 * Build relation context from parsed relation
 *
 * @param relation - Parsed relation
 * @param config - Parsed config
 * @param fieldContexts - Field contexts for reference
 * @returns RelationContext - Enhanced relation context
 */
export function buildRelationContext(
  relation: ParsedEntityRelation,
  config: ParsedEntityConfig,
  fieldContexts: FieldContext[],
): RelationContext {
  const targetNames = createNameVariants(relation.targetType);

  // Find corresponding field context
  const fieldContext = fieldContexts.find((f) => f.name === relation.name);

  // Use enhanced inference if we have field context
  let inferred: InferredRelation;
  if (fieldContext) {
    inferred = inferRelationKindWithContext(
      {
        name: fieldContext.name,
        type: fieldContext.type,
        optional: fieldContext.optional,
        readonly: fieldContext.readonly,
        nullable: fieldContext.nullable,
        array: fieldContext.array,
      },
      relation.name,
      relation.targetType,
    );
  } else {
    // Fallback to basic inference
    inferred = inferRelationKindWithContext(
      {
        name: relation.name,
        type: relation.targetType,
        optional: false,
        readonly: false,
        nullable: false,
        array: relation.relationType === 'one-to-many' || relation.relationType === 'many-to-many',
      },
      relation.name,
      relation.targetType,
    );
  }

  // Determine join column and other relation metadata
  const joinColumn = determineJoinColumn(relation, fieldContext);
  const joinTable = determineJoinTable(relation, inferred.kind);
  const targetField = determineTargetField(relation, inferred.kind);

  return {
    name: relation.name,
    targetType: relation.targetType,
    targetNames: {
      pascal: targetNames.pascal,
      camel: targetNames.camel,
      kebab: targetNames.kebab,
      snake: targetNames.snake,
      screamingSnake: targetNames.screamingSnake,
      plural: targetNames.plural,
      singular: targetNames.singular,
    },
    relationType: inferred.kind,
    confidence: inferred.confidence,
    reasoning: inferred.reasoning,
    isArray: relation.relationType === 'one-to-many' || relation.relationType === 'many-to-many',
    isNullable: fieldContext?.nullable || false,
    isReadonly: fieldContext?.readonly || false,
    joinColumn,
    inverseJoinColumn: determineInverseJoinColumn(relation, inferred.kind),
    joinTable,
    targetField,
    inverseRelation: determineInverseRelationName(relation, targetNames),
  };
}

/**
 * Determine join column name
 *
 * @param relation - Parsed relation
 * @param fieldContext - Field context
 * @returns string | undefined - Join column name
 */
function determineJoinColumn(relation: ParsedEntityRelation, fieldContext?: FieldContext): string | undefined {
  if (fieldContext?.columnName) {
    return fieldContext.columnName;
  }

  // Default naming convention
  const targetNames = createNameVariants(relation.targetType);
  return `${targetNames.snake}_id`;
}

/**
 * Determine inverse join column name
 *
 * @param relation - Parsed relation
 * @param relationType - Relation type
 * @returns string | undefined - Inverse join column name
 */
function determineInverseJoinColumn(relation: ParsedEntityRelation, relationType: string): string | undefined {
  if (relationType === 'many-to-many') {
    // For many-to-many, we need both sides
    const sourceNames = createNameVariants(relation.name);
    return `${sourceNames.snake}_id`;
  }

  return undefined;
}

/**
 * Determine join table name
 *
 * @param relation - Parsed relation
 * @param relationType - Relation type
 * @returns string | undefined - Join table name
 */
function determineJoinTable(relation: ParsedEntityRelation, relationType: string): string | undefined {
  if (relationType === 'many-to-many') {
    const targetNames = createNameVariants(relation.targetType);
    const sourceNames = createNameVariants(relation.name);

    // Create join table name from both entities
    return [sourceNames.snake, targetNames.snake].sort().join('_');
  }

  return undefined;
}

/**
 * Determine target field name
 *
 * @param relation - Parsed relation
 * @param relationType - Relation type
 * @returns string | undefined - Target field name
 */
function determineTargetField(relation: ParsedEntityRelation, relationType: string): string | undefined {
  if (relationType === 'many-to-one' || relationType === 'one-to-one') {
    // For these relations, the target typically has an 'id' field
    return 'id';
  }

  return undefined;
}

/**
 * Determine inverse relation name
 *
 * @param relation - Parsed relation
 * @param targetNames - Target name variants
 * @returns string | undefined - Inverse relation name
 */
function determineInverseRelationName(relation: ParsedEntityRelation, targetNames: any): string | undefined {
  // Basic heuristic: inverse relation is based on source entity name
  const sourceNames = createNameVariants(relation.name.replace(/^[a-z]/, (c) => c.toUpperCase()));

  // If the relation is array, inverse is likely singular
  if (relation.relationType === 'one-to-many') {
    return sourceNames.singular;
  }

  // If the relation is singular, inverse is likely plural
  if (relation.relationType === 'many-to-one') {
    return sourceNames.plural;
  }

  return sourceNames.camel;
}

/**
 * Build relation groups context
 *
 * @param relations - Array of relation contexts
 * @returns RelationGroupsContext - Relation groups
 */
export function buildRelationGroupsContext(relations: RelationContext[]): RelationGroupsContext {
  const groups: RelationGroupsContext = {
    oneToOne: [],
    oneToMany: [],
    manyToOne: [],
    manyToMany: [],
    unknown: [],
    all: relations,
  };

  for (const relation of relations) {
    switch (relation.relationType) {
      case 'one-to-one':
        groups.oneToOne.push(relation);
        break;
      case 'one-to-many':
        groups.oneToMany.push(relation);
        break;
      case 'many-to-one':
        groups.manyToOne.push(relation);
        break;
      case 'many-to-many':
        groups.manyToMany.push(relation);
        break;
      case 'unknown':
        groups.unknown.push(relation);
        break;
    }
  }

  return groups;
}

/**
 * Build relation query context
 *
 * @param relations - Array of relation contexts
 * @param entityName - Entity name for type generation
 * @returns RelationQueryContext - Relation queries
 */
export function buildRelationQueryContext(relations: RelationContext[], entityName: string): RelationQueryContext {
  const entityNames = createNameVariants(entityName);

  const asOneQueries: RelationQueryContext['asOneQueries'] = [];
  const asManyQueries: RelationQueryContext['asManyQueries'] = [];

  for (const relation of relations) {
    // As one queries (for single relations)
    if (relation.relationType === 'many-to-one' || relation.relationType === 'one-to-one') {
      asOneQueries.push({
        relationName: relation.name,
        typeName: `I${entityNames.pascal}AsOne${relation.targetNames.pascal}Query`,
        targetType: relation.targetType,
      });
    }

    // As many queries (for array relations)
    if (relation.relationType === 'one-to-many' || relation.relationType === 'many-to-many') {
      asManyQueries.push({
        relationName: relation.name,
        typeName: `I${entityNames.pascal}AsMany${relation.targetNames.pascal}Query`,
        targetType: relation.targetType,
      });
    }
  }

  return {
    asOneQueries,
    asManyQueries,
  };
}

/**
 * Build relation map context
 *
 * @param relations - Array of relation contexts
 * @param entityName - Entity name for map generation
 * @returns RelationMapContext - Relation maps
 */
export function buildRelationMapContext(relations: RelationContext[], entityName: string): RelationMapContext {
  const entityNames = createNameVariants(entityName);

  const entityRelations: Record<string, RelationContext> = {};
  const relationTargets: Record<string, string> = {};
  const relationFields: Record<string, string> = {};

  for (const relation of relations) {
    // Entity relations map
    entityRelations[relation.name] = relation;

    // Relation targets map
    relationTargets[relation.name] = relation.targetType;

    // Relation fields map
    if (relation.joinColumn) {
      relationFields[relation.name] = relation.joinColumn;
    }
  }

  return {
    entityRelations,
    relationTargets,
    relationFields,
  };
}

/**
 * Build complete relations context
 *
 * @param relations - Parsed relations
 * @param config - Parsed config
 * @param fieldContexts - Field contexts
 * @param entityName - Entity name
 * @returns RelationsContext - Complete relations context
 */
export function buildRelationsContext(
  relations: ParsedEntityRelation[],
  config: ParsedEntityConfig,
  fieldContexts: FieldContext[],
  entityName: string,
): RelationsContext {
  // Build relation contexts
  const relationContexts = relations.map((relation) => buildRelationContext(relation, config, fieldContexts));

  // Build groups
  const groups = buildRelationGroupsContext(relationContexts);

  // Build query context
  const queries = buildRelationQueryContext(relationContexts, entityName);

  // Build map context
  const maps = buildRelationMapContext(relationContexts, entityName);

  return {
    groups,
    queries,
    maps,
    relationKeys: config.relationKeys,
  };
}
