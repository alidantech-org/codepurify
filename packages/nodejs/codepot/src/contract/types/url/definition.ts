import { DefinitionItem } from '../definition';

export const UrlEnv = {
  local: 'local',
  development: 'development',
  staging: 'staging',
  production: 'production',
} as const;

export type UrlEnv = (typeof UrlEnv)[keyof typeof UrlEnv];

export interface UrlDefinition extends DefinitionItem {
  env: UrlEnv;
  uri: string;
}
