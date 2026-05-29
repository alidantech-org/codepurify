// =========================
// PRIMITIVES
// =========================

export type PrimitiveType = 'string' | 'integer' | 'number' | 'boolean';

export interface PrimitiveDefinition {
  type: PrimitiveType;

  format?: string;

  description?: string;

  example?: unknown;

  validation?: {
    minimum?: number;
    maximum?: number;

    minLength?: number;
    maxLength?: number;

    pattern?: string;

    precision?: number;

    integer?: boolean;
  };

  metadata?: Record<string, unknown>;
}