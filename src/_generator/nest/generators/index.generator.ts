/**
 * Tempurify Index Generator
 *
 * Generates index.ts barrel export files from NestEntityContext.
 * Accepts entity context → template renderer → generated file plan.
 */

import { renderNestTemplate, TemplateRenderError } from '../templates/renderer';
import { validateTemplateVariables } from '../templates/variables';
import type { NestEntityContext } from '../context/nest-context-builder';
import type { GeneratedFilePlan } from './context.generator';

/**
 * Index generator options
 */
export interface IndexGeneratorOptions {
  /** Tempurify configuration */
  config?: any;
  /** Project root directory */
  rootDir?: string;
  /** Whether to include debug information */
  debug?: boolean;
  /** Components to include in index */
  components?: {
    context?: boolean;
    controller?: boolean;
    service?: boolean;
    module?: boolean;
    entity?: boolean;
    dto?: boolean;
  };
}

/**
 * Generates index files from NestEntityContext
 */
export class IndexGenerator {
  constructor(private options: IndexGeneratorOptions = {}) {}

  /**
   * Generates index file plan for a single entity
   *
   * @param entityContext - Nest entity context
   * @returns Generated file plan
   * @throws Error if generation fails
   */
  async generateIndexFile(entityContext: NestEntityContext): Promise<GeneratedFilePlan> {
    try {
      // Validate template variables
      const validation = validateTemplateVariables('index', entityContext);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.missing.join(', ')}`);
      }

      // Render template using the new renderer
      const renderResult = await renderNestTemplate('index', entityContext, this.options.config, this.options.rootDir || process.cwd());

      const plan: GeneratedFilePlan = {
        kind: 'index',
        filePath: entityContext.entity.files.indexFile,
        content: renderResult.content,
        source: 'index.generator.ts',
        template: renderResult.templatePath,
        immutable: true,
      };

      return plan;
    } catch (error) {
      if (error instanceof TemplateRenderError) {
        throw new Error(`Template rendering failed: ${error.message}`);
      }

      throw new Error(`Failed to generate index for entity: ${entityContext.entity.names.pascal}`);
    }
  }

  /**
   * Generates index file plans for multiple entities
   *
   * @param entityContexts - Array of nest entity contexts
   * @returns Array of generated file plans
   */
  async generateIndexFiles(entityContexts: NestEntityContext[]): Promise<GeneratedFilePlan[]> {
    const plans: GeneratedFilePlan[] = [];

    for (const entityContext of entityContexts) {
      try {
        const plan = await this.generateIndexFile(entityContext);
        plans.push(plan);
      } catch (error) {
        console.error(`Failed to generate index for entity: ${entityContext.entity.names.pascal}`, error);
        // Continue with other entities
      }
    }

    return plans;
  }

  /**
   * Prepares index context with component flags
   *
   * @param entityContext - Nest entity context
   * @returns Enhanced context for index template
   */
  private prepareIndexContext(entityContext: NestEntityContext): any {
    const components = this.options.components || {
      context: true,
      controller: false,
      service: false,
      module: false,
      entity: false,
      dto: false,
    };

    return {
      entity: entityContext.entity,
      fields: entityContext.fields,
      relations: entityContext.relations,
      hasContext: components.context,
      hasController: components.controller,
      hasService: components.service,
      hasModule: components.module,
      hasEntity: components.entity,
      hasDto: components.dto,
    };
  }

  /**
   * Validates that all required components are available
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
    components: IndexGeneratorOptions['components'];
  } {
    return {
      availableTemplates: ['index'],
      components: this.options.components,
    };
  }
}

/**
 * Convenience function to generate index file plan
 *
 * @param entityContext - Nest entity context
 * @param options - Generator options
 * @returns Generated file plan
 */
export async function generateIndexFile(entityContext: NestEntityContext, options?: IndexGeneratorOptions): Promise<GeneratedFilePlan> {
  const generator = new IndexGenerator(options);
  return generator.generateIndexFile(entityContext);
}
