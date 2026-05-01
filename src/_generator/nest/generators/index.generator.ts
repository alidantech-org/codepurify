/**
 * Tempurify Index Generator
 *
 * Generates index.ts barrel export files from NestEntityContext.
 * Accepts entity context → template renderer → generated file plan.
 */

import { renderTemplate, TemplateRenderError } from '../templates/renderer';
import { defaultRegistry } from '../templates/registry';
import { validateTemplateVariables } from '../templates/variables';
import type { NestEntityContext } from '../context/nest-context-builder';
import type { GeneratedFilePlan } from './context.generator';

/**
 * Index generator options
 */
export interface IndexGeneratorOptions {
  /** Template directory */
  templateDir?: string;
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
  private templateDir: string;

  constructor(private options: IndexGeneratorOptions = {}) {
    this.templateDir = options.templateDir || 'templates';
  }

  /**
   * Generates index file plan for a single entity
   *
   * @param entityContext - Nest entity context
   * @returns Generated file plan
   * @throws Error if generation fails
   */
  async generateIndexFile(entityContext: NestEntityContext): Promise<GeneratedFilePlan> {
    try {
      // Prepare index context with component flags
      const indexContext = this.prepareIndexContext(entityContext);

      // Validate template variables
      const validation = validateTemplateVariables('index', indexContext);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.missing.join(', ')}`);
      }

      // Get template path from registry
      const templatePath = defaultRegistry.getPath('index');
      if (!templatePath) {
        throw new Error('Index template not found in registry');
      }

      // Render template using the renderer
      const renderResult = await renderTemplate(templatePath, indexContext);

      const plan: GeneratedFilePlan = {
        kind: 'index',
        filePath: entityContext.entity.files.indexFile,
        content: renderResult.content,
        source: 'index.generator.ts',
        template: templatePath,
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
    // Check that index template exists
    if (!defaultRegistry.has('index')) {
      throw new Error('Index template not registered');
    }

    // Check that template file exists
    const templatePath = defaultRegistry.getPath('index');
    if (!templatePath) {
      throw new Error('Index template path not found');
    }

    // Try to read the template file
    try {
      const { readFile } = await import('node:fs/promises');
      await readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Index template file not readable: ${templatePath}`);
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
    components: IndexGeneratorOptions['components'];
  } {
    return {
      templateDir: this.templateDir,
      registeredTemplates: defaultRegistry.listTemplates().length,
      availableTemplates: defaultRegistry.listTemplates(),
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
