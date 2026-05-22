export type LogLevel = 'silent' | 'normal' | 'verbose' | 'debug';

export interface LoggerConfig {
  readonly level?: LogLevel;
  readonly debug?: boolean;
  readonly verbose?: boolean;
  readonly silent?: boolean;
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
