import type { ParsedEntityField } from './entity-parser';

/**
 * Relation kind types
 */
export type RelationKind = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | 'unknown';

/**
 * Inferred relation metadata
 */
export interface InferredRelation {
  /** Relation kind */
  kind: RelationKind;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reasoning for the inference */
  reasoning: string;
}

/**
 * Infer relation kind from field metadata
 *
 * @param field - Parsed entity field
 * @returns InferredRelation - Inferred relation information
 */
export function inferRelationKind(field: ParsedEntityField): InferredRelation {
  // Skip primitive types - they can't be relations
  const primitiveTypes = ['string', 'number', 'boolean', 'Date', 'any', 'unknown', 'object'];
  if (primitiveTypes.includes(field.type)) {
    return {
      kind: 'unknown',
      confidence: 0.9,
      reasoning: 'Primitive type cannot be a relation',
    };
  }

  // Rule-based inference based on field characteristics
  if (field.array) {
    if (field.readonly) {
      // readonly X[] => one-to-many
      return {
        kind: 'one-to-many',
        confidence: 0.8,
        reasoning: 'Readonly array indicates one-to-many relation',
      };
    } else {
      // X[] (not readonly) => many-to-many or one-to-many
      return {
        kind: 'many-to-many',
        confidence: 0.6,
        reasoning: 'Array without readonly suggests many-to-many relation',
      };
    }
  } else {
    // Single object reference
    if (field.nullable) {
      // nullable readonly X => many-to-one
      return {
        kind: 'many-to-one',
        confidence: 0.8,
        reasoning: 'Nullable readonly field indicates many-to-one relation',
      };
    } else if (field.readonly) {
      // readonly X => many-to-one
      return {
        kind: 'many-to-one',
        confidence: 0.7,
        reasoning: 'Readonly field indicates many-to-one relation',
      };
    } else {
      // X (no modifiers) => unknown, could be one-to-one or many-to-one
      return {
        kind: 'one-to-one',
        confidence: 0.4,
        reasoning: 'Unmodified object field could be one-to-one relation',
      };
    }
  }
}

/**
 * Enhanced relation inference with context
 *
 * @param field - Parsed entity field
 * @param fieldName - Field name for additional context
 * @param targetType - Target entity type
 * @returns InferredRelation - Enhanced inferred relation
 */
export function inferRelationKindWithContext(field: ParsedEntityField, fieldName: string, targetType: string): InferredRelation {
  const baseInference = inferRelationKind(field);

  // Apply naming conventions to improve confidence
  const namingInference = inferFromNaming(fieldName, targetType);

  // Combine inferences
  if (baseInference.kind === namingInference.kind) {
    return {
      ...baseInference,
      confidence: Math.min(baseInference.confidence + 0.2, 1.0),
      reasoning: `${baseInference.reasoning} + ${namingInference.reasoning}`,
    };
  }

  // If naming suggests a different relation, use naming with lower confidence
  if (namingInference.confidence > baseInference.confidence) {
    return {
      ...namingInference,
      confidence: Math.max(namingInference.confidence - 0.1, 0.3),
      reasoning: `${namingInference.reasoning} (overriding base inference)`,
    };
  }

  return baseInference;
}

/**
 * Infer relation type from naming conventions
 *
 * @param fieldName - Field name
 * @param targetType - Target entity type
 * @returns InferredRelation - Naming-based inference
 */
function inferFromNaming(fieldName: string, targetType: string): InferredRelation {
  const lowerFieldName = fieldName.toLowerCase();
  const lowerTargetType = targetType.toLowerCase();

  // Singular vs plural patterns
  if (lowerFieldName.endsWith('s') && !lowerTargetType.endsWith('s')) {
    // Field is plural, target is singular => likely one-to-many or many-to-many
    return {
      kind: 'one-to-many',
      confidence: 0.6,
      reasoning: `Plural field name '${fieldName}' suggests collection relation`,
    };
  }

  if (!lowerFieldName.endsWith('s') && lowerTargetType.endsWith('s')) {
    // Field is singular, target is plural => unusual, might be many-to-many
    return {
      kind: 'many-to-many',
      confidence: 0.5,
      reasoning: `Singular field with plural target suggests many-to-many`,
    };
  }

  // ID field patterns
  if (lowerFieldName.endsWith('id') || lowerFieldName.endsWith('_id')) {
    return {
      kind: 'many-to-one',
      confidence: 0.7,
      reasoning: `Field name '${fieldName}' suggests foreign key`,
    };
  }

  // Reference patterns
  if (lowerFieldName.includes('ref') || lowerFieldName.includes('reference')) {
    return {
      kind: 'many-to-one',
      confidence: 0.6,
      reasoning: `Field name '${fieldName}' suggests reference relation`,
    };
  }

  // Default unknown
  return {
    kind: 'unknown',
    confidence: 0.3,
    reasoning: `Naming convention doesn't provide clear indication`,
  };
}

/**
 * Validate relation inference against configuration
 *
 * @param inferred - Inferred relation
 * @param configRelationKeys - Relation keys from config
 * @returns boolean - True if inference is consistent with config
 */
export function validateRelationInference(inferred: InferredRelation, configRelationKeys: string[]): boolean {
  // If config doesn't specify relation keys, we can't validate
  if (configRelationKeys.length === 0) {
    return true;
  }

  // High confidence inferences are more likely to be correct
  if (inferred.confidence >= 0.8) {
    return true;
  }

  // Unknown relations are always questionable
  if (inferred.kind === 'unknown') {
    return false;
  }

  return true;
}
