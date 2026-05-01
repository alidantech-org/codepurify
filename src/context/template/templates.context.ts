/**
 * Tempurify template context registry chunk: templates
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const templates_context = {
  /**
   * Template and output generation configuration.
   */
  templates: {
    /** Directory containing package-provided fallback templates. */
    builtin_dir: 'templates.builtin_dir',

    /** Directory containing user-owned templates. */
    user_dir: 'templates.user_dir',

    /** Whether user templates can override package templates. */
    allow_user_overrides: 'templates.allow_user_overrides',

    /** Registered output templates. */
    outputs: [
      {
        /** Output registration name. */
        name: 'templates.outputs[].name',

        /** Template file name or template registry key. */
        template: 'templates.outputs[].template',

        /** Output file path pattern. */
        path: 'templates.outputs[].path',

        /** Whether this output is considered immutable/generated-only. */
        immutable: 'templates.outputs[].immutable',

        /** Whether existing files may be overwritten. */
        overwrite: 'templates.outputs[].overwrite',
      },
    ],
  },
} as const;
