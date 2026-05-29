export interface UrlDefinition {
  key: string;

  env: string;

  uri: string;

  description?: string;

  metadata?: Record<string, unknown>;
}
