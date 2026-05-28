import { PackageOutputFormat } from '@/contract/config/package-config.types';

export const DefaultOutputConfig = {
  folder: 'sdk/openapi',
  filePrefix: 'openapi',
  debugFilePrefix: 'contract-debug',
  formats: [PackageOutputFormat.json, PackageOutputFormat.yaml],
} as const;

export const ContentType = {
  json: 'application/json',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
