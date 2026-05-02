/**
 * Codepurify template context registry chunk: discovery
 *
 * This file is generated from the monolithic variable registry.
 * It intentionally exports only a const object chunk.
 */
export const discovery_context = {
  /**
   * Entity discovery and folder strategy configuration.
   */
  discovery: {
    /** Entity layout strategy, for example grouped or flat. */
    strategy: 'discovery.strategy',

    /** Pattern used to resolve grouped entity folders. */
    group_pattern: 'discovery.group_pattern',

    /** Pattern used to resolve a single entity folder. */
    entity_folder_pattern: 'discovery.entity_folder_pattern',
  },

  /**
   * Check constraint metadata.
   */
  check: {
    /** Check constraint name. */
    name: 'check.name',

    /** Raw check expression. */
    expression: 'check.expression',
  },

  /**
   * File system paths used by Codepurify itself.
   */
  paths: {
    /** Codepurify working directory. */
    codepurify_dir: 'paths.codepurify_dir',

    /** Manifest file path. */
    manifest_file: 'paths.manifest_file',

    /** Cache directory path. */
    cache_dir: 'paths.cache_dir',

    /** Backups directory path. */
    backups_dir: 'paths.backups_dir',
  },

  /**
   * Project-level configuration and resolved project paths.
   */
  project: {
    /** Absolute project root directory. */
    root_dir: 'project.root_dir',

    /** Source directory where generated runtime code is written. */
    source_dir: 'project.source_dir',

    /** Directory where user-owned entity type/config definitions live. */
    types_dir: 'project.types_dir',
  },
  /**
   * Codepurify template context registry chunk: output
   *
   * This file is generated from the monolithic variable registry.
   * It intentionally exports only a const object chunk.
   */
  /**
   * Generated output file plan information.
   */
  output: {
    /** Generated output kind, for example context, entity, service, controller. */
    kind: 'output.kind',

    /** Template used to produce this output. */
    template: 'output.template',

    /** Output file path. */
    file_path: 'output.file_path',

    /** Whether output is immutable/generated-only. */
    immutable: 'output.immutable',

    /** Generator name that produced this file. */
    generator: 'output.generator',
  },

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
