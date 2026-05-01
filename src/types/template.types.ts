/**
 * Tempura Template Types
 *
 * Types for template registry, rendering, and variable definitions.
 * Provides contracts for the template system.
 */

export interface TemplateRenderInput<TContext = unknown> {
  templateName: string;
  templatePath: string;
  outputPath: string;
  context: TContext;
}

export interface TemplateRenderResult {
  templateName: string;
  outputPath: string;
  content: string;
}

export interface TemplateRegistryEntry {
  name: string;
  path: string;
  outputPattern: string;
  immutable: boolean;
}
