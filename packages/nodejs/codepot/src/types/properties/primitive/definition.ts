// =========================
// PRIMITIVES
// =========================

import { DefinitionItem } from '../../definition';

export const PrimitiveType = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  integer: 'integer',
} as const;

export type PrimitiveType = (typeof PrimitiveType)[keyof typeof PrimitiveType];

export const PrimitiveFormat = {
  date: 'date',
  dateTime: 'date-time',
  time: 'time',
  email: 'email',
  uri: 'uri',
  url: 'url',
  uuid: 'uuid',
  objectId: 'object-id',
  phone: 'phone',
  password: 'password',
  binary: 'binary',
  custom: 'custom',
} as const;

export type PrimitiveFormat = (typeof PrimitiveFormat)[keyof typeof PrimitiveFormat];

export interface PrimitiveValidationDefinition {
  minimum?: number;

  maximum?: number;

  exclusiveMinimum?: number;

  exclusiveMaximum?: number;

  /**
   * Decimal step/scale validation.
   * Example: 0.01 for two decimal places or 0.5 for half steps.
   */
  multipleOf?: number;

  minLength?: number;

  maxLength?: number;

  pattern?: string;
}

export interface PrimitiveDefinition extends DefinitionItem {
  /** Primitive type */
  type: PrimitiveType;

  /** Primitive format */
  format?: PrimitiveFormat;

  /** Example value */
  example?: unknown;

  /** Validation rules */
  validation?: PrimitiveValidationDefinition;
}
