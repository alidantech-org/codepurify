import type { RefResolver } from '../refs/ref-resolver.types.js';
import type { CompilerContext } from '../compiler-context.js';
import { compilePropertySchema } from '../schemas/compile-property-schema.js';
import { compileRouteSchema } from './compile-route-schema.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import type {
  InferredParameterComponent,
  InferredRequestBodyComponent,
  InferredResponseComponent,
  InferredRouteComponents,
} from './inferred-route-components.types.js';
import { RouteParameterFieldValue } from '../../routes/route.types.js';

export function compileInferredComponents(
  inferred: InferredRouteComponents,
  resolver: RefResolver,
  context?: CompilerContext,
): {
  parameters: Record<string, unknown>;
  requestBodies: Record<string, unknown>;
  responses: Record<string, unknown>;
} {
  return {
    parameters: compileInferredParameters(inferred.parameters, resolver, context),
    requestBodies: compileInferredRequestBodies(inferred.requestBodies, resolver, context),
    responses: compileInferredResponses(inferred.responses, resolver, context),
  };
}

function compileInferredParameters(
  parameters: Map<string, InferredParameterComponent>,
  resolver: RefResolver,
  context?: CompilerContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, param] of parameters.entries()) {
    result[name] = {
      name: param.parameterName,
      in: param.in,
      required: param.required,
      schema: compileParameterSchema(param.schema, resolver),
    };
  }

  return result;
}

function compileParameterSchema(param: RouteParameterFieldValue, resolver: RefResolver): unknown {
  const ref = isRefUsage(param) ? param.ref : param;
  const nullable = isRefUsage(param) ? param.nullable : undefined;

  const schema = { $ref: `#pending/${ref.id}` };

  if (nullable) {
    return {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function compileInferredRequestBodies(
  requestBodies: Map<string, InferredRequestBodyComponent>,
  resolver: RefResolver,
  context?: CompilerContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, body] of requestBodies.entries()) {
    result[name] = {
      required: body.required,
      description: body.description,
      content: {
        [body.contentType]: {
          schema: compileRouteSchema(body.schema, resolver),
        },
      },
    };
  }

  return result;
}

function compileInferredResponses(
  responses: Map<string, InferredResponseComponent>,
  resolver: RefResolver,
  context?: CompilerContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, response] of responses.entries()) {
    if (response.noContent) {
      result[name] = {
        description: response.description,
      };
    } else if (response.contentType) {
      result[name] = {
        description: response.description,
        content: {
          [response.contentType]: {
            schema: response.schema ? compileRouteSchema(response.schema, resolver) : undefined,
          },
        },
      };
    } else {
      result[name] = {
        description: response.description,
      };
    }
  }

  return result;
}
