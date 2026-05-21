import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenApiDocument } from "../openapi/openapi.types.js";

export interface OpenApiValidationResult {
  readonly valid: boolean;
  readonly error?: unknown;
}

export async function validateOpenApiDocument(
  document: OpenApiDocument,
): Promise<OpenApiValidationResult> {
  try {
    // @ts-expect-error
    SwaggerParser.validate(document as unknown as Record<string, unknown>);

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error,
    };
  }
}
