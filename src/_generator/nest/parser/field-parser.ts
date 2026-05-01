import { Node } from 'ts-morph';

/**
 * Parsed field type metadata
 */
export interface ParsedFieldType {
  /** Clean type name */
  type: string;
  /** Is nullable type */
  nullable: boolean;
  /** Is array type */
  array: boolean;
  /** Is primitive type */
  primitive: boolean;
  /** Is enum type */
  enum: boolean;
}

/**
 * Parse field type from type node
 *
 * @param node - Type node from AST
 * @returns ParsedFieldType - Parsed field type metadata
 */
export function parseFieldType(node: Node): ParsedFieldType {
  const typeText = node.getText() || 'unknown';

  const nullable = isNullableType(typeText);
  const array = isArrayType(typeText);
  const primitive = isPrimitiveType(typeText);
  const enumType = isEnumType(typeText);

  // Clean up type text
  let cleanType = typeText;
  if (nullable) {
    cleanType = cleanType.replace(/\s*\|\s*(null|undefined)/g, '');
  }
  if (array) {
    cleanType = cleanType.replace(/\[\]/g, '').replace(/Array<\s*(.*?)\s*>/g, '$1');
  }
  cleanType = cleanType.trim();

  return {
    type: cleanType,
    nullable,
    array,
    primitive,
    enum: enumType,
  };
}

/**
 * Check if type is nullable
 *
 * @param typeText - Type text string
 * @returns boolean - True if nullable
 */
export function isNullableType(typeText: string): boolean {
  return typeText.includes('null') || typeText.includes('undefined');
}

/**
 * Check if type is array
 *
 * @param typeText - Type text string
 * @returns boolean - True if array
 */
export function isArrayType(typeText: string): boolean {
  return typeText.includes('[]') || typeText.includes('Array<');
}

/**
 * Check if type is primitive
 *
 * @param typeText - Type text string
 * @returns boolean - True if primitive
 */
export function isPrimitiveType(typeText: string): boolean {
  const primitiveTypes = ['string', 'number', 'boolean', 'Date', 'any', 'unknown', 'object'];

  // Clean up type text first
  let cleanType = typeText;
  if (isNullableType(cleanType)) {
    cleanType = cleanType.replace(/\s*\|\s*(null|undefined)/g, '');
  }
  if (isArrayType(cleanType)) {
    cleanType = cleanType.replace(/\[\]/g, '').replace(/Array<\s*(.*?)\s*>/g, '$1');
  }
  cleanType = cleanType.trim();

  return primitiveTypes.includes(cleanType);
}

/**
 * Check if type is enum
 *
 * @param typeText - Type text string
 * @returns boolean - True if enum
 */
export function isEnumType(typeText: string): boolean {
  // Check for enum-like patterns
  const enumPatterns = [
    /^[A-Z][A-Z0-9_]*$/, // ALL_CAPS
    /^[A-Z][a-zA-Z0-9]*Status$/, // SomethingStatus
    /^[A-Z][a-zA-Z0-9]*Type$/, // SomethingType
    /^[A-Z][a-zA-Z0-9]*Kind$/, // SomethingKind
  ];

  // Clean up type text first
  let cleanType = typeText;
  if (isNullableType(cleanType)) {
    cleanType = cleanType.replace(/\s*\|\s*(null|undefined)/g, '');
  }
  if (isArrayType(cleanType)) {
    cleanType = cleanType.replace(/\[\]/g, '').replace(/Array<\s*(.*?)\s*>/g, '$1');
  }
  cleanType = cleanType.trim();

  // Skip primitive types
  if (isPrimitiveType(cleanType)) {
    return false;
  }

  return enumPatterns.some((pattern) => pattern.test(cleanType));
}

/**
 * Normalize type name for consistent handling
 *
 * @param typeText - Type text string
 * @returns string - Normalized type name
 */
export function normalizeTypeName(typeText: string): string {
  let cleanType = typeText;

  // Remove null/undefined unions
  if (isNullableType(cleanType)) {
    cleanType = cleanType.replace(/\s*\|\s*(null|undefined)/g, '');
  }

  // Remove array syntax
  if (isArrayType(cleanType)) {
    cleanType = cleanType.replace(/\[\]/g, '').replace(/Array<\s*(.*?)\s*>/g, '$1');
  }

  // Trim whitespace
  cleanType = cleanType.trim();

  return cleanType;
}

/**
 * Extract array element type
 *
 * @param typeText - Type text string
 * @returns string - Array element type
 */
export function extractArrayElementType(typeText: string): string {
  if (!isArrayType(typeText)) {
    return typeText;
  }

  // Handle Array<T> syntax
  const arrayMatch = typeText.match(/Array<\s*(.*?)\s*>/);
  if (arrayMatch) {
    return arrayMatch[1].trim();
  }

  // Handle T[] syntax
  const bracketMatch = typeText.match(/(.+?)\[\]/);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }

  return typeText;
}
