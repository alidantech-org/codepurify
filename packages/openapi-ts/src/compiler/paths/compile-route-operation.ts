import type { OpenApiOperation } from "../../openapi/openapi.types.js";
import type { RouteDefinition } from "../../routes/route.types.js";
import { applySdkExtensions } from "../../sdk/apply-sdk-extensions.js";
import { ContentType } from "../../output/output.constants.js";
import type { RefResolver } from "../refs/ref-resolver.types.js";
import { compileRouteParameters } from "./compile-route-parameters.js";
import { compileRouteSchema } from "./compile-route-schema.js";

export function compileRouteOperation(
  route: RouteDefinition,
  resolver: RefResolver,
): OpenApiOperation {
  const operation: OpenApiOperation = {
    operationId: route.operationId,
    tags: route.tags,
    summary: route.summary,
    description: route.description,
    responses: compileResponses(route, resolver),
  };

  const parameters = [
    ...compileRouteParameters(route.params, "path", resolver),
    ...compileRouteParameters(route.query, "query", resolver),
  ];

  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  if (route.body) {
    operation.requestBody = {
      required: true,
      content: {
        [ContentType.json]: {
          schema: compileRouteSchema(route.body, resolver),
        },
      },
    };
  }

  if (route.meta) {
    // @ts-expect-error
    applySdkExtensions(operation, route.meta);
  }

  return operation;
}

function compileResponses(
  route: RouteDefinition,
  resolver: RefResolver,
): Record<string, unknown> {
  if (route.responses) {
    return Object.fromEntries(
      Object.entries(route.responses).map(([status, schema]) => [
        status,
        jsonResponse(
          `Response ${status}`,
          compileRouteSchema(schema, resolver),
        ),
      ]),
    );
  }

  if (route.response) {
    return {
      200: jsonResponse(
        "Success",
        compileRouteSchema(route.response, resolver),
      ),
    };
  }

  return {
    204: {
      description: "No content",
    },
  };
}

function jsonResponse(
  description: string,
  schema: unknown,
): Record<string, unknown> {
  return {
    description,
    content: {
      [ContentType.json]: {
        schema,
      },
    },
  };
}
