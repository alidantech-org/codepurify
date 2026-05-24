import type { RefResolver } from '../refs/ref-resolver.types.js';
import type { CompilerContext } from '../compiler-context.js';
import { compilePropertySchema } from '../schemas/compile-property-schema.js';
import { compileRouteSchema } from './compile-route-schema.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isEngineRef } from '../../validation/ref-guards.js';
import type {
  InferredParameterComponent,
  InferredRequestBodyComponent,
  InferredResponseComponent,
  InferredRouteComponents,
  InferredQueryParameterSchema,
} from './inferred-route-components.types.js';

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
    const component: Record<string, unknown> = {
      name: param.parameterName,
      in: param.in,
      required: param.required,
      schema: compileParameterSchema(param.schema, resolver),
    };

    result[name] = component;
  }

  return result;
}

function compileParameterSchema(param: InferredQueryParameterSchema, resolver: RefResolver): unknown {
  const ref = isRefUsage(param) ? param.ref : param;
  const nullable = isRefUsage(param) ? param.nullable : undefined;

  if (!isEngineRef(ref)) {
    throw new Error(
      `Inferred component schema must use an EngineRef or RefUsage<EngineRef>. Received: ${JSON.stringify(describeUnknownRef(ref))}`,
    );
  }

  if (!ref.id) {
    throw new Error('Cannot create pending ref for inferred component: missing ref id.');
  }

  const schema = { $ref: `#pending/${ref.id}` };

  if (nullable) {
    return {
      anyOf: [schema, { type: 'null' }],
    };
  }

  return schema;
}

function describeUnknownRef(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return { type: typeof value, value };
  }

  const record = value as Record<string, unknown>;

  return {
    keys: Object.keys(record),
    kind: record.kind,
    name: record.name,
    id: record.id,
    refKind: typeof record.ref === 'object' && record.ref !== null ? (record.ref as Record<string, unknown>).kind : undefined,
  };
}

function compileInferredRequestBodies(
  requestBodies: Map<string, InferredRequestBodyComponent>,
  resolver: RefResolver,
  context?: CompilerContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, body] of requestBodies.entries()) {
    const schema = typeof body.schema === 'object' && body.schema && 'schema' in body.schema ? body.schema.schema : body.schema;

    result[name] = {
      required: body.required,
      description: body.description,
      content: {
        [body.contentType]: {
          schema: compileRouteSchema(schema, resolver),
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
      const schema =
        response.schema && typeof response.schema === 'object' && 'schema' in response.schema ? response.schema.schema : response.schema;

      result[name] = {
        description: response.description,
        content: {
          [response.contentType]: {
            schema: schema ? compileRouteSchema(schema, resolver) : undefined,
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
