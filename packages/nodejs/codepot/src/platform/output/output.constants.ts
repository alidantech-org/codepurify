import { PackageOutputFormat } from "../config/package-config.types.js";

export const DefaultOutputConfig = {
  folder: "sdk/openapi",
  filePrefix: "openapi",
  debugFilePrefix: "contract-debug",
  formats: [PackageOutputFormat.json, PackageOutputFormat.yaml],
} as const;

export const ContentType = {
  json: "application/json",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
