export type LogLevel = 'silent' | 'normal' | 'verbose' | 'debug';

export interface LoggerConfig {
  readonly level?: LogLevel;
  readonly debug?: boolean;
  readonly verbose?: boolean;
  readonly silent?: boolean;
  readonly interactive?: boolean;
}

export interface SpinnerHandle {
  readonly text: (message: string) => void;
  readonly succeed: (message?: string) => void;
  readonly fail: (message?: string) => void;
  readonly warn: (message?: string) => void;
  readonly stop: () => void;
}

export interface LogContext {
  readonly scope?: string;
  readonly version?: string;
  readonly resource?: string;
  readonly operation?: string;
  readonly component?: string;
  readonly file?: string;
}

export interface LoggerDataOptions {
  readonly maxDepth?: number;
  readonly maxArrayLength?: number;
}

export interface LogContext {
  readonly scope?: string;
  readonly version?: string;
  readonly operation?: string;
}

export interface Logger {
  child(context: LogContext): Logger;
  task(message: string): LogTask;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
  verbose(message: string): void;
  debug(message: string): void;
}

export interface LogTask {
  update(message: string): void;
  succeed(message?: string): void;
  fail(message?: string): void;
}

export interface LoggerOptions {
  readonly level?: LogLevel;
}
