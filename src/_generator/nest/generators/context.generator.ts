/**
 * Tempura Context Generator
 *
 * Generates app.context.ts files from NestEntityContext.
 * Accepts entity context → template renderer → generated file plan.
 */

import { renderTemplate, TemplateRenderError } from '../templates/renderer';
import { defaultRegistry } from '../templates/registry';
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
  /** Template directory */
  templateDir?: string;
  /** Whether to include debug information */
  debug?: boolean;
}

/**
 * Generates context files from NestEntityContext
 */
export class ContextGenerator {
  private templateDir: string;

  constructor(private options: ContextGeneratorOptions = {}) {
    this.templateDir = options.templateDir || 'templates';
  }

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

      // Get template path from registry
      const templatePath = defaultRegistry.getPath('context');
      if (!templatePath) {
        throw new Error('Context template not found in registry');
      }

      // Render template using the renderer
      const renderResult = await renderTemplate(templatePath, entityContext);

      const plan: GeneratedFilePlan = {
        kind: 'context',
        filePath: entityContext.entity.files.contextFile,
        content: renderResult.content,
        source: 'context.generator.ts',
        template: templatePath,
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
   * Validates that all required components are available
   *
   * @throws Error if validation fails
   */
  async validate(): Promise<void> {
    // Check that context template exists
    if (!defaultRegistry.has('context')) {
      throw new Error('Context template not registered');
    }

    // Check that template file exists
    const templatePath = defaultRegistry.getPath('context');
    if (!templatePath) {
      throw new Error('Context template path not found');
    }

    // Try to read the template file
    try {
      const { readFile } = await import('node:fs/promises');
      await readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Context template file not readable: ${templatePath}`);
    }
  }

  /**
   * Gets generation statistics
   *
   * @returns Generator statistics
   */
  getStats(): {
    templateDir: string;
    registeredTemplates: number;
    availableTemplates: string[];
  } {
    return {
      templateDir: this.templateDir,
      registeredTemplates: defaultRegistry.listTemplates().length,
      availableTemplates: defaultRegistry.listTemplates(),
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
