/**
 * Tempurify Context Generator
 *
 * Generates app.context.ts files from NestEntityContext.
 * Accepts entity context → template renderer → generated file plan.
 */

import { renderNestTemplate, TemplateRenderError } from '../templates/renderer';
import { validateTemplateVariables } from '../templates/variables';
import type { NestEntityContext } from '../context/nest-context-builder';

/**
 * Generated file plan type
 */
export interface GeneratedFilePlan {
  /** File kind */
  kind: 'context' | 'index' | 'controller' | 'service' | 'module' | 'dto' | 'entity';
  /** Output file path */
  filePath: string;
  /** Generated content */
  content: string;
  /** Source template */
  source: string;
  /** Template used */
  template: string;
  /** File is immutable */
  immutable: boolean;
}

/**
 * Context generator options
 */
export interface ContextGeneratorOptions {
  /** Tempurify configuration */
  config?: any;
  /** Project root directory */
  rootDir?: string;
  /** Whether to include debug information */
  debug?: boolean;
}

/**
 * Generates context files from NestEntityContext
 */
export class ContextGenerator {
  constructor(private options: ContextGeneratorOptions = {}) {}

  /**
   * Generates context file plan for a single entity
   *
   * @param entityContext - Nest entity context
   * @returns Generated file plan
   * @throws Error if generation fails
   */
  async generateContextFile(entityContext: NestEntityContext): Promise<GeneratedFilePlan> {
    try {
      // Validate template variables
      const validation = validateTemplateVariables('context', entityContext);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.missing.join(', ')}`);
      }

      // Render template using the new renderer
      const renderResult = await renderNestTemplate('context', entityContext, this.options.config, this.options.rootDir || process.cwd());

      const plan: GeneratedFilePlan = {
        kind: 'context',
        filePath: entityContext.entity.files.contextFile,
        content: renderResult.content,
        source: 'context.generator.ts',
        template: renderResult.templatePath,
        immutable: true,
      };

      return plan;
    } catch (error) {
      if (error instanceof TemplateRenderError) {
        throw new Error(`Template rendering failed: ${error.message}`);
      }

      throw new Error(`Failed to generate context for entity: ${entityContext.entity.names.pascal}`);
    }
  }

  /**
   * Generates context file plans for multiple entities
   *
   * @param entityContexts - Array of nest entity contexts
   * @returns Array of generated file plans
   */
  async generateContextFiles(entityContexts: NestEntityContext[]): Promise<GeneratedFilePlan[]> {
    const plans: GeneratedFilePlan[] = [];

    for (const entityContext of entityContexts) {
      try {
        const plan = await this.generateContextFile(entityContext);
        plans.push(plan);
      } catch (error) {
        console.error(`Failed to generate context for entity: ${entityContext.entity.names.pascal}`, error);
        // Continue with other entities
      }
    }

    return plans;
  }

  /**
   * Validates the generator setup
   *
   * @throws Error if validation fails
   */
  async validate(): Promise<void> {
    // Template validation is now handled by renderNestTemplate
    // No additional validation needed here
  }

  /**
   * Gets generation statistics
   *
   * @returns Generator statistics
   */
  getStats(): {
    availableTemplates: string[];
  } {
    return {
      availableTemplates: ['context'],
    };
  }
}

/**
 * Convenience function to generate context file plan
 *
 * @param entityContext - Nest entity context
 * @param options - Generator options
 * @returns Generated file plan
 */
export async function generateContextFile(entityContext: NestEntityContext, options?: ContextGeneratorOptions): Promise<GeneratedFilePlan> {
  const generator = new ContextGenerator(options);
  return generator.generateContextFile(entityContext);
}
