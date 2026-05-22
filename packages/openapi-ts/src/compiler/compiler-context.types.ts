import type { CompilerLogger } from '../logger/compiler-logger.js';

export interface CompilerContext {
  readonly logger: CompilerLogger;
}
