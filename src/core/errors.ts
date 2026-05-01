/**
 * Tempura Error System
 *
 * Provides structured error handling with error codes and detailed information.
 * All Tempura errors should extend from TempuraError for consistent handling.
 */

/**
 * Error codes for different types of Tempura errors
 */
export enum TempuraErrorCode {
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
}

/**
 * Base error class for all Tempura errors
 */
export class TempuraError extends Error {
  constructor(
    public code: TempuraErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'TempuraError';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TempuraError);
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
 * Creates a TempuraError with the given code and message
 *
 * @param code - Error code
 * @param message - Error message
 * @param details - Optional error details
 * @returns TempuraError instance
 */
export function createTempuraError(code: TempuraErrorCode, message: string, details?: Record<string, unknown>): TempuraError {
  return new TempuraError(code, message, details);
}

/**
 * Type guard to check if an error is a TempuraError
 *
 * @param error - Error to check
 * @returns True if error is a TempuraError
 */
export function isTempuraError(error: unknown): error is TempuraError {
  return error instanceof TempuraError;
}
