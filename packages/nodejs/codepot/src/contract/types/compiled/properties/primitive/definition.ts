// src/contract/types/compiled/properties/primitive/definition.ts

import type { DefinitionItem } from '../../definition';

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

export const PrimitiveType = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  integer: 'integer',
} as const;

export type PrimitiveType = (typeof PrimitiveType)[keyof typeof PrimitiveType];

// ============================================================================
// PRIMITIVE FORMATS
// ============================================================================

export const PrimitiveFormat = {
  date: 'date',
  date_time: 'date_time',
  time: 'time',
  email: 'email',
  uri: 'uri',
  url: 'url',
  uuid: 'uuid',
  object_id: 'object_id',
  phone: 'phone',
  password: 'password',
  binary: 'binary',
  custom: 'custom',
} as const;

export type PrimitiveFormat = (typeof PrimitiveFormat)[keyof typeof PrimitiveFormat];

// ============================================================================
// VALIDATION
// ============================================================================

export interface PrimitiveValidationDefinition {
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusive_minimum?: number;
  readonly exclusive_maximum?: number;

  /**
   * Decimal step/scale validation.
   * Example: 0.01 for two decimal places or 0.5 for half steps.
   */
  readonly multiple_of?: number;

  readonly min_length?: number;
  readonly max_length?: number;
  readonly pattern?: string;
}

// ============================================================================
// PRIMITIVE DEFINITION
// ============================================================================

export interface PrimitiveDefinition extends DefinitionItem {
  readonly type: PrimitiveType;
  readonly format?: PrimitiveFormat;
  readonly validation?: PrimitiveValidationDefinition;
  readonly example?: unknown;
}
