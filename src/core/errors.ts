/**
 * Tempurify Error System
 *
 * Provides structured error handling with error codes and detailed information.
 * All Tempurify errors should extend from TempurifyError for consistent handling.
 */

/**
 * Error codes for different types of Tempurify errors
 */
export enum TempurifyErrorCode {
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  CONFIG_INVALID = 'CONFIG_INVALID',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',
  MANIFEST_INVALID = 'MANIFEST_INVALID',
  GENERATION_FAILED = 'GENERATION_FAILED',
  BACKUP_FAILED = 'BACKUP_FAILED',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  COMMAND_FAILED = 'COMMAND_FAILED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
}

/**
 * Base error class for all Tempurify errors
 */
export class TempurifyError extends Error {
  constructor(
    public code: TempurifyErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'TempurifyError';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TempurifyError);
    }
  }

  /**
   * Returns a JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }

  /**
   * Returns a formatted error message
   */
  toString(): string {
    let result = `${this.name} [${this.code}]: ${this.message}`;

    if (this.details) {
      const detailsStr = Object.entries(this.details)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      result += ` (${detailsStr})`;
    }

    return result;
  }
}

/**
 * Creates a TempurifyError with the given code and message
 *
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @returns TempurifyError instance
 */
export function createTempurifyError(code: TempurifyErrorCode, message: string, details?: Record<string, unknown>): TempurifyError {
  return new TempurifyError(code, message, details);
}

/**
 * Type guard to check if an error is a TempurifyError
 *
 * @param error - Error to check
 * @returns True if error is a TempurifyError
 */
export function isTempurifyError(error: unknown): error is TempurifyError {
  return error instanceof TempurifyError;
}
