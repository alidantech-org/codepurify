import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { Eta } from 'eta';
import { getPackageRootFromModule } from '../../../utils/package-root';
import { logger } from '../../../core/logger';
import { createTempurifyError, TempurifyErrorCode } from '../../../core/errors';
import { REQUIRED_TEMPLATE_VARIABLES, TEMPLATE_VARIABLES } from '../data/template-variables';

/**
 * Template rendering options
 */
export interface RenderOptions {
  /** Template cache enabled */
  cache?: boolean;
  /** Auto escape HTML */
  autoEscape?: boolean;
  /** Template file encoding */
  encoding?: BufferEncoding;
  /** Custom template functions */
  functions?: Record<string, Function>;
}

/**
 * Template rendering result
 */
export interface RenderResult {
  /** Rendered content */
  content: string;
  /** Template path used */
  templatePath: string;
  /** Render time in milliseconds */
  renderTime: number;
}

/**
 * Template rendering error
 */
export class TemplateRenderError extends Error {
  constructor(
    message: string,
    public templatePath: string,
    public context?: any,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'TemplateRenderError';
  }
}

/**
 * Template renderer using Eta engine
 */
export class TemplateRenderer {
  private eta: Eta;
  private templateCache: Map<string, string> = new Map();
  private options: Required<RenderOptions>;
  private customFunctions: Record<string, Function> = {};

  constructor(options: RenderOptions = {}) {
    this.options = {
      cache: true,
      autoEscape: false,
      encoding: 'utf8',
      functions: {},
      ...options,
    };

    // Store custom functions
    this.customFunctions = { ...this.options.functions };

    // Initialize Eta
    this.eta = new Eta({
      cache: this.options.cache,
      autoEscape: this.options.autoEscape,
      // Expose top-level variables directly (no 'it' prefix required)
      varName: 'it',
      useWith: true,
    });
  }

  /**
   * Render template with context
   *
   * @param templatePath - Path to template file
   * @param context - Template context data
   * @returns Promise<RenderResult> - Render result
   * @throws TemplateRenderError if rendering fails
   */
  async render(templatePath: string, context: any): Promise<RenderResult> {
    const startTime = Date.now();

    try {
      // Load template content
      const templateContent = await this.loadTemplate(templatePath);

      // Merge custom functions into context
      const renderContext = {
        ...context,
        ...this.getBuiltInFunctions(),
        ...this.customFunctions,
      };

      // Render template
      const content = this.eta.renderString(templateContent, renderContext);

      const renderTime = Date.now() - startTime;

      return {
        content,
        templatePath,
        renderTime,
      };
    } catch (error) {
      const renderTime = Date.now() - startTime;

      if (error instanceof TemplateRenderError) {
        throw error;
      }

      throw new TemplateRenderError(
        `Failed to render template: ${error instanceof Error ? error.message : String(error)}`,
        templatePath,
        context,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Render template string directly
   *
   * @param templateString - Template string content
   * @param context - Template context data
   * @returns string - Rendered content
   * @throws TemplateRenderError if rendering fails
   */
  renderString(templateString: string, context: any): string {
    try {
      return this.eta.renderString(templateString, context);
    } catch (error) {
      throw new TemplateRenderError(
        `Failed to render template string: ${error instanceof Error ? error.message : String(error)}`,
        '<string>',
        context,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Load template content from file
   *
   * @param templatePath - Path to template file
   * @returns Promise<string> - Template content
   * @throws TemplateRenderError if loading fails
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    // Resolve template path
    const resolvedPath = resolve(templatePath);

    // Check cache first
    if (this.options.cache && this.templateCache.has(resolvedPath)) {
      return this.templateCache.get(resolvedPath)!;
    }

    try {
      const content = await readFile(resolvedPath, this.options.encoding);

      // Cache the template if enabled
      if (this.options.cache) {
        this.templateCache.set(resolvedPath, content);
      }

      return content;
    } catch (error) {
      throw new TemplateRenderError(
        `Failed to load template file: ${error instanceof Error ? error.message : String(error)}`,
        resolvedPath,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Get built-in helper functions
   */
  private getBuiltInFunctions(): Record<string, Function> {
    return {
      // String manipulation helpers
      upper: (str: string) => str?.toUpperCase() || '',
      lower: (str: string) => str?.toLowerCase() || '',
      capitalize: (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : ''),
      titleCase: (str: string) => str?.replace(/\b\w/g, (l) => l.toUpperCase()) || '',

      // Array helpers
      first: (arr: any[]) => arr?.[0],
      last: (arr: any[]) => arr?.[arr.length - 1],
      length: (arr: any[] | string) => arr?.length || 0,

      // Object helpers
      keys: (obj: any) => (obj ? Object.keys(obj) : []),
      values: (obj: any) => (obj ? Object.values(obj) : []),

      // Conditional helpers
      eq: (a: any, b: any) => a === b,
      ne: (a: any, b: any) => a !== b,
      gt: (a: number, b: number) => a > b,
      lt: (a: number, b: number) => a < b,
      gte: (a: number, b: number) => a >= b,
      lte: (a: number, b: number) => a <= b,

      // Type checking helpers
      isArray: (value: any) => Array.isArray(value),
      isObject: (value: any) => value !== null && typeof value === 'object' && !Array.isArray(value),
      isString: (value: any) => typeof value === 'string',
      isNumber: (value: any) => typeof value === 'number',
      isBoolean: (value: any) => typeof value === 'boolean',

      // JSON helpers
      json: (obj: any) => JSON.stringify(obj, null, 2),
      jsonCompact: (obj: any) => JSON.stringify(obj),

      // Path helpers
      basename: (path: string) => path?.split(/[/\\]/).pop() || '',
      dirname: (path: string) => path?.split(/[/\\]/).slice(0, -1).join('/') || '',

      // Debug helpers
      debug: (value: any) => {
        console.log('Template Debug:', value);
        return '';
      },
      inspect: (value: any) => JSON.stringify(value, null, 2),
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.templateCache.size,
      keys: Array.from(this.templateCache.keys()),
    };
  }

  /**
   * Set custom function
   *
   * @param name - Function name
   * @param func - Function implementation
   */
  setFunction(name: string, func: Function): void {
    this.customFunctions[name] = func;
  }

  /**
   * Remove custom function
   *
   * @param name - Function name
   */
  removeFunction(name: string): void {
    delete this.customFunctions[name];
  }

  /**
   * Get all registered functions
   */
  getFunctions(): Record<string, Function> {
    return {
      ...this.getBuiltInFunctions(),
      ...this.customFunctions,
    };
  }
}

/**
 * Default renderer instance
 */
export const defaultRenderer = new TemplateRenderer();

/**
 * Convenience function to render template
 *
 * @param templatePath - Path to template file
 * @param context - Template context data
 * @param options - Render options
 * @returns Promise<RenderResult> - Render result
 */
export async function renderTemplate(templatePath: string, context: any, options?: RenderOptions): Promise<RenderResult> {
  const renderer = options ? new TemplateRenderer(options) : defaultRenderer;
  return renderer.render(templatePath, context);
}

/**
 * Convenience function to render template string
 *
 * @param templateString - Template string content
 * @param context - Template context data
 * @param options - Render options
 * @returns string - Rendered content
 */
export function renderTemplateString(templateString: string, context: any, options?: RenderOptions): string {
  const renderer = options ? new TemplateRenderer(options) : defaultRenderer;
  return renderer.renderString(templateString, context);
}

/**
 * Render NestJS template using package built-in templates or user overrides
 *
 * @param templateKey - Template key from registry ('context', 'index', etc.)
 * @param context - Template context data
 * @param config - Tempurify configuration
 * @param rootDir - Project root directory
 * @returns Promise<RenderResult> - Render result
 * @throws TemplateRenderError if template not found or rendering fails
 */
export async function renderNestTemplate(templateKey: string, context: any, config: any, rootDir: string): Promise<RenderResult> {
  try {
    // Get template registry entry
    const { getTemplateRegistry } = await import('./registry');
    const registry = getTemplateRegistry();
    const template = registry.get(templateKey);

    if (!template) {
      throw new TemplateRenderError(`Template '${templateKey}' not found in registry`, templateKey, context);
    }

    let templatePath: string | undefined;
    let usingBuiltin = false;

    // Check if user overrides are enabled and user template exists
    if (config.templates?.allowUserOverrides) {
      const userTemplatePath = join(rootDir, config.templates.userDir, 'nest', template.path);

      try {
        await readFile(userTemplatePath, 'utf8');
        templatePath = userTemplatePath;
        logger.info(`Using user template: ${template.path}`);
      } catch (error) {
        if (error instanceof Error && (error as any).code === 'ENOENT') {
          // User template not found, fall back to built-in
          usingBuiltin = true;
        } else {
          throw error;
        }
      }
    }

    // Use built-in template if no user template found or overrides disabled
    if (!templatePath || usingBuiltin) {
      const packageRoot = await getPackageRootFromModule(import.meta.url);
      templatePath = join(packageRoot, 'templates', template.path);
      logger.debug(`Using built-in template: ${template.path}`);
      logger.debug(`Resolved template file: ${templatePath}`);
    }

    // Validate that the template file exists
    if (!existsSync(templatePath)) {
      throw createTempurifyError(
        TempurifyErrorCode.TEMPLATE_NOT_FOUND,
        `Built-in template not found: ${template.path}. Resolved path: ${templatePath}`,
      );
    }

    // Prepare template data with top-level variables expected by templates
    const templateData = {
      entity: context.entity,
      fields: context.fields,
      relations: context.relations,
      basename: (path: string) => basename(path),
      // Preserve TypeORM-specific data if it exists
      ...(context.imports && { imports: context.imports }),
      ...(context.base && { base: context.base }),
      ...(context.schema && { schema: context.schema }),
      ...(context.indexes && { indexes: context.indexes }),
      ...(context.columns && { columns: context.columns }),
      ...(context.typeormRelations && { typeormRelations: context.typeormRelations }),
    };

    // Validate required template variables
    for (const key of REQUIRED_TEMPLATE_VARIABLES) {
      if (!(key in templateData)) {
        throw createTempurifyError(
          TempurifyErrorCode.TEMPLATE_NOT_FOUND,
          `Template data missing required key "${key}" for template "${templatePath}". Available keys: ${Object.keys(templateData).join(', ')}`,
        );
      }
    }

    // Debug logging
    console.log('TEMPLATE DATA KEYS:', Object.keys(templateData));
    console.log('ENTITY KEYS:', templateData.entity ? Object.keys(templateData.entity) : 'UNDEFINED');
    console.log('IMPORTS:', templateData.imports ? 'PRESENT' : 'MISSING');
    console.log('FULL TEMPLATE DATA:', JSON.stringify(templateData, null, 2));
    logger.debug(`Rendering template: ${templatePath}`);
    logger.debug(`Template keys: ${Object.keys(templateData).join(', ')}`);
    logger.debug(`Entity data: ${JSON.stringify(templateData.entity, null, 2)}`);

    // Render the template
    const renderer = new TemplateRenderer();
    const result = await renderer.render(templatePath, templateData);

    return result;
  } catch (error) {
    if (error instanceof TemplateRenderError) {
      throw error;
    }

    throw new TemplateRenderError(
      `Failed to render NestJS template '${templateKey}': ${error instanceof Error ? error.message : String(error)}`,
      templateKey,
      context,
      error instanceof Error ? error : undefined,
    );
  }
}
