import { createLogger } from "@/utils/logger/logging/create-logger";
import { Logger } from "@/utils/logger/logging/logger.types";
import { XCodegenDtoRole } from "../targets/codegen/codegen-extension.types";


export interface CompilerContext {
  readonly logger?: Logger;
  /**
   * Tracks DTO component usage by role across route compilation.
   * Key: component ref id, Value: set of roles where this DTO is used.
   */
  readonly dtoRoleUsage?: Map<string, Set<XCodegenDtoRole>>;
}

export interface ResolvedCompilerContext {
  readonly logger: Logger;
  readonly dtoRoleUsage: Map<string, Set<XCodegenDtoRole>>;
}

export function resolveCompilerContext(context: CompilerContext = {}): ResolvedCompilerContext {
  return {
    logger: context.logger ?? createLogger({ level: 'silent' }),
    dtoRoleUsage: context.dtoRoleUsage ?? new Map(),
  };
}
