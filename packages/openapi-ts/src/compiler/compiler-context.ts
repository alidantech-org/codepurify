import { createLogger } from '../logging/create-logger.js';
import type { Logger } from '../logging/logger.types.js';

export interface CompilerContext {
  readonly logger?: Logger;
}

export interface ResolvedCompilerContext {
  readonly logger: Logger;
}

export function resolveCompilerContext(context: CompilerContext = {}): ResolvedCompilerContext {
  return {
    logger: context.logger ?? createLogger({ level: 'silent' }),
  };
}
