// =========================
// PRIMITIVES
// =========================

export type PrimitiveType = 'string' | 'number' | 'boolean';

export type PrimitiveFormat =
  | 'date'
  | 'date-time'
  | 'time'
  | 'email'
  | 'uri'
  | 'url'
  | 'uuid'
  | 'object-id'
  | 'phone'
  | 'password'
  | 'binary'
  | 'custom';

export interface PrimitiveValidationDefinition {
  /**
   * If true, number must be an integer.
   * Only valid when type is "number".
   */
  integer?: boolean;

  minimum?: number;

  maximum?: number;

  exclusiveMinimum?: number;

  exclusiveMaximum?: number;

  /**
   * Decimal step/scale validation.
   * Example: 0.01 for two decimal places.
   */
  multipleOf?: number;

  minLength?: number;

  maxLength?: number;

  pattern?: string;
}

export interface PrimitiveDefinition {
  type: PrimitiveType;

  format?: PrimitiveFormat;

  description?: string;

  example?: unknown;

  validation?: PrimitiveValidationDefinition;

  deprecated?: boolean;

  metadata?: Record<string, unknown>;
}
