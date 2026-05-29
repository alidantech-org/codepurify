export interface UrlDefinition {
  key: string;

  env: string;

  uri: string;

  description?: string;

  meta: Record<string, unknown>;
}
