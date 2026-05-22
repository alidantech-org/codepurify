import pc from 'picocolors';

import type { LogContext, LoggerConfig, LoggerDataOptions, LogLevel } from './logger.types.js';

function resolveLogLevel(config?: LoggerConfig): LogLevel {
  if (config?.silent === true) return 'silent';
  if (config?.debug === true) return 'debug';
  if (config?.verbose === true) return 'verbose';
  return config?.level ?? 'normal';
}

function shouldLog(current: LogLevel, required: LogLevel): boolean {
  const rank: Record<LogLevel, number> = {
    silent: 0,
    normal: 1,
    verbose: 2,
    debug: 3,
  };

  return rank[current] >= rank[required];
}

function sanitizeLogData(value: unknown, depth = 0, options: LoggerDataOptions = {}, seen = new WeakSet<object>()): unknown {
  const maxDepth = options.maxDepth ?? 4;
  const maxArrayLength = options.maxArrayLength ?? 20;

  if (typeof value === 'function') return '[Function]';
  if (value === null || typeof value !== 'object') return value;

  if (depth >= maxDepth) return '[MaxDepth]';

  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) {
    return value.slice(0, maxArrayLength).map((item) => sanitizeLogData(item, depth + 1, options, seen));
  }

  const record = value as Record<string, unknown>;

  if ('_zod' in record || '_def' in record || 'toJSONSchema' in record) {
    return '[ZodSchema]';
  }

  const output: Record<string, unknown> = {};

  for (const [key, child] of Object.entries(record)) {
    if (key === 'zod') {
      output[key] = '[ZodSchema]';
      continue;
    }

    if (typeof child === 'function') {
      output[key] = '[Function]';
      continue;
    }

    output[key] = sanitizeLogData(child, depth + 1, options, seen);
  }

  return output;
}

function formatContext(context?: LogContext): string {
  if (!context) return '';

  const parts = [
    context.scope,
    context.version ? `v:${context.version}` : undefined,
    context.resource ? `r:${context.resource}` : undefined,
    context.operation ? `op:${context.operation}` : undefined,
    context.component ? `c:${context.component}` : undefined,
    context.file ? `file:${context.file}` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? pc.dim(` [${parts.join(' ')}]`) : '';
}

export class CompilerLogger {
  private readonly level: LogLevel;
  private readonly context?: LogContext;

  constructor(config?: LoggerConfig, context?: LogContext) {
    this.level = resolveLogLevel(config);
    this.context = context;
  }

  child(context: LogContext): CompilerLogger {
    return new CompilerLogger(
      { level: this.level },
      {
        ...this.context,
        ...context,
      },
    );
  }

  isSilent(): boolean {
    return this.level === 'silent';
  }

  isVerbose(): boolean {
    return shouldLog(this.level, 'verbose');
  }

  isDebug(): boolean {
    return shouldLog(this.level, 'debug');
  }

  info(message: string, context?: LogContext): void {
    if (!shouldLog(this.level, 'normal')) return;
    console.log(`${pc.cyan('◼')} ${message}${formatContext({ ...this.context, ...context })}`);
  }

  step(message: string, context?: LogContext): void {
    this.info(message, context);
  }

  success(message: string, context?: LogContext): void {
    if (!shouldLog(this.level, 'normal')) return;
    console.log(`${pc.green('✓')} ${message}${formatContext({ ...this.context, ...context })}`);
  }

  warn(message: string, context?: LogContext): void {
    if (this.level === 'silent') return;
    console.warn(`${pc.yellow('⚠')} ${message}${formatContext({ ...this.context, ...context })}`);
  }

  error(message: string, context?: LogContext): void {
    console.error(`${pc.red('✗')} ${message}${formatContext({ ...this.context, ...context })}`);
  }

  verbose(message: string, data?: unknown, context?: LogContext): void {
    if (!shouldLog(this.level, 'verbose')) return;

    console.log(`${pc.gray('•')} ${message}${formatContext({ ...this.context, ...context })}`);

    if (data !== undefined) {
      console.log(pc.dim(JSON.stringify(sanitizeLogData(data), null, 2)));
    }
  }

  debug(message: string, data?: unknown, context?: LogContext): void {
    if (!shouldLog(this.level, 'debug')) return;

    console.log(`${pc.magenta('◆')} ${message}${formatContext({ ...this.context, ...context })}`);

    if (data !== undefined) {
      console.log(pc.dim(JSON.stringify(sanitizeLogData(data, 0, { maxDepth: 8, maxArrayLength: 100 }), null, 2)));
    }
  }

  time(label: string, context?: LogContext): () => void {
    if (!shouldLog(this.level, 'debug')) {
      return () => undefined;
    }

    const startedAt = performance.now();
    this.debug(`Started ${label}`, undefined, context);

    return () => {
      const duration = Math.round(performance.now() - startedAt);
      this.debug(`Finished ${label} in ${duration}ms`, undefined, context);
    };
  }
}
