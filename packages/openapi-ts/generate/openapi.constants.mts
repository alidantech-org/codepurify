// ─── Output Configuration ─────────────────────────────────────────────────────────────

export const OUTPUT_FOLDER = 'sdk/openapi';
export const OUTPUT_FILE_PREFIX = 'openapi';
export const OUTPUT_FORMATS = ['json', 'yaml'] as const;
export const DEBUG_FILE_PREFIX = 'contract-debug';

export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

// ─── OpenAPI Configuration ────────────────────────────────────────────────────────────

export const OPENAPI_VERSION = 'openapi-3.1';
export const OPENAPI_TARGET = 'openapi-3.1' as const;
export const SERVER_URL = '/api';
export const SERVER_DESCRIPTION = 'RideRescue API';

// ─── Component Reference Patterns ─────────────────────────────────────────────────────

export const REF_PATTERNS = {
  schemas: '#/components/schemas/',
  responses: '#/components/responses/',
  parameters: '#/components/parameters/',
  requestBodies: '#/components/requestBodies/',
} as const;

// ─── Console Messages ─────────────────────────────────────────────────────────────────

export const MESSAGES = {
  generating: 'Generating OpenAPI 3.1.1 spec...',
  generated: (path: string) => `✓ Generated ${path}`,
  validated: (title: string, version: string) => `✓ Validated OpenAPI spec: ${title} v${version}`,
  validationFailed: '✗ Validation failed:',
  done: 'Done!',
  error: 'Error generating OpenAPI spec:',
} as const;

// ─── Parameter Locations ─────────────────────────────────────────────────────────────

export const PARAMETER_LOCATIONS = {
  path: 'path',
  query: 'query',
  header: 'header',
  cookie: 'cookie',
} as const;

// ─── Content Types ───────────────────────────────────────────────────────────────────

export const CONTENT_TYPES = {
  json: 'application/json',
} as const;
