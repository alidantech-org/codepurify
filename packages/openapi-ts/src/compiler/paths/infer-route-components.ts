import type {
  RouteDefinition,
  RouteParameterMap,
  RouteSchemaInput,
  RouteResponseInput,
  RouteBodyInput,
  RouteParameterFieldValue,
} from '../../routes/route.types.js';
import type { CompilerContext } from '../compiler-context.types.js';
import type {
  InferredParameterComponent,
  InferredRequestBodyComponent,
  InferredResponseComponent,
  InferredRouteComponents,
} from './inferred-route-components.types.js';
import type { VersionDefaults } from '../../version/version-contract.types.js';
import { ContentType, ContentTypeInput } from '../../openapi/content-type.js';
import { getParameterName, getRequestBodyName, getResponseName, getDefaultResponseName } from '../../naming/component-name.js';
import { getRefRequired } from '../../validation/ref-usage-guards.js';

export function inferRouteComponents(
  route: RouteDefinition,
  pathParams: RouteParameterMap | undefined,
  resourceKey?: string,
  defaultResponses?: Record<number, RouteResponseInput>,
  versionDefaults?: VersionDefaults,
  context?: CompilerContext,
): InferredRouteComponents {
  const logger = context?.logger.child({ scope: 'inference' });

  const components: InferredRouteComponents = {
    parameters: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
  };

  // Infer path parameters from top-level route path params
  if (pathParams) {
    for (const [name, param] of Object.entries(pathParams)) {
      const componentName = getParameterName(name, 'path', resourceKey);
      const inferred: InferredParameterComponent = {
        name: componentName,
        parameterName: name,
        in: 'path',
        required: true, // Path params are always required
        schema: param,
        resourceKey,
      };
      components.parameters.set(componentName, inferred);
      logger?.debug('Inferred parameter component', {
        name: componentName,
        parameterName: name,
        in: 'path',
        required: true,
        resourceKey,
      });
    }
  }

  // Infer operation-level parameters
  if (route.params) {
    for (const [name, param] of Object.entries(route.params)) {
      const componentName = getParameterName(name, 'path', resourceKey, route.operationId);
      const inferred: InferredParameterComponent = {
        name: componentName,
        parameterName: name,
        in: 'path',
        required: true, // Path params are always required
        schema: param,
        resourceKey,
        operationId: route.operationId,
      };
      components.parameters.set(componentName, inferred);
      logger?.debug('Inferred parameter component', {
        name: componentName,
        parameterName: name,
        in: 'path',
        required: true,
        resourceKey,
        operationId: route.operationId,
      });
    }
  }

  if (route.query) {
    for (const [name, param] of Object.entries(route.query)) {
      const componentName = getParameterName(name, 'query', resourceKey, route.operationId);
      const inferred: InferredParameterComponent = {
        name: componentName,
        parameterName: name,
        in: 'query',
        required: !isOptional(param),
        schema: param,
        resourceKey,
        operationId: route.operationId,
      };
      components.parameters.set(componentName, inferred);
      logger?.debug('Inferred parameter component', {
        name: componentName,
        parameterName: name,
        in: 'query',
        required: !isOptional(param),
        resourceKey,
        operationId: route.operationId,
      });
    }
  }

  // Infer request body
  if (route.body) {
    const componentName = getRequestBodyName(route.operationId || 'Unknown');
    const { schema, required, description, contentType } = extractBodySchema(route.body, versionDefaults);
    const inferred: InferredRequestBodyComponent = {
      name: componentName,
      required: required ?? true,
      schema,
      description,
      contentType,
      resourceKey,
      operationId: route.operationId || 'Unknown',
    };
    components.requestBodies.set(componentName, inferred);
    logger?.debug('Inferred request body component', {
      name: componentName,
      operationId: route.operationId || 'Unknown',
      required: required ?? true,
      contentType,
    });
  }

  // Infer responses
  if (route.response) {
    const componentName = getResponseName(route.operationId || 'Unknown', 200);
    const { schema, description, contentType, noContent } = extractResponseSchema(route.response, versionDefaults);
    const inferred: InferredResponseComponent = {
      name: componentName,
      status: 200,
      schema,
      description: description || 'Success',
      contentType: noContent ? undefined : contentType,
      resourceKey,
      operationId: route.operationId || 'Unknown',
      noContent,
    };
    components.responses.set(componentName, inferred);
    logger?.debug('Inferred response component', {
      name: componentName,
      operationId: route.operationId || 'Unknown',
      status: 200,
      noContent,
      contentType,
    });
  }

  if (route.responses) {
    for (const [status, response] of Object.entries(route.responses)) {
      const statusCode = parseInt(status, 10);
      const componentName = getResponseName(route.operationId || 'Unknown', statusCode);
      const { schema, description, contentType, noContent } = extractResponseSchema(response, versionDefaults);
      const inferred: InferredResponseComponent = {
        name: componentName,
        status: statusCode,
        schema,
        description: description || `Response ${statusCode}`,
        contentType: noContent ? undefined : contentType,
        resourceKey,
        operationId: route.operationId || 'Unknown',
        noContent,
      };
      components.responses.set(componentName, inferred);
      logger?.debug('Inferred response component', {
        name: componentName,
        operationId: route.operationId || 'Unknown',
        status: statusCode,
        noContent,
        contentType,
      });
    }
  }

  // Infer default responses
  if (defaultResponses) {
    for (const [status, response] of Object.entries(defaultResponses)) {
      const statusCode = parseInt(status, 10);
      const componentName = getDefaultResponseName(statusCode);
      const { schema, description, contentType, noContent } = extractResponseSchema(response, versionDefaults);
      const inferred: InferredResponseComponent = {
        name: componentName,
        status: statusCode,
        schema,
        description: description || `Default ${statusCode} response`,
        contentType: noContent ? undefined : contentType,
        operationId: 'Default',
        noContent,
      };
      // Don't override explicit responses
      if (!components.responses.has(componentName)) {
        components.responses.set(componentName, inferred);
      }
    }
  }

  logger?.verbose('Inferred route component counts', {
    parameters: components.parameters.size,
    requestBodies: components.requestBodies.size,
    responses: components.responses.size,
  });

  return components;
}

function extractBodySchema(
  body: RouteBodyInput,
  versionDefaults?: VersionDefaults,
): {
  schema: RouteSchemaInput;
  required?: boolean;
  description?: string;
  contentType: ContentTypeInput;
} {
  if (typeof body === 'object' && 'schema' in body) {
    const objBody = body as { schema: RouteSchemaInput; required?: boolean; description?: string; contentType?: ContentTypeInput };
    return {
      schema: objBody.schema,
      required: objBody.required,
      description: objBody.description,
      contentType: objBody.contentType ?? versionDefaults?.requestContentType ?? ContentType.json,
    };
  }
  return { schema: body as RouteSchemaInput, contentType: versionDefaults?.requestContentType ?? ContentType.json };
}

function extractResponseSchema(
  response: RouteResponseInput,
  versionDefaults?: VersionDefaults,
): {
  schema?: RouteSchemaInput;
  description?: string;
  contentType?: ContentTypeInput;
  noContent?: boolean;
} {
  if (typeof response === 'object' && 'schema' in response) {
    const objResponse = response as { schema: RouteSchemaInput; description?: string; contentType?: ContentTypeInput };
    return {
      schema: objResponse.schema,
      description: objResponse.description,
      contentType: objResponse.contentType ?? versionDefaults?.responseContentType ?? ContentType.json,
    };
  }

  // Check for noContent
  if (typeof response === 'object' && 'kind' in response && response.kind === 'noContent') {
    return {
      description: 'No content',
      noContent: true,
    };
  }

  return {
    schema: response as RouteSchemaInput,
    contentType: versionDefaults?.responseContentType ?? ContentType.json,
  };
}

function isOptional(param: RouteParameterFieldValue): boolean {
  const required = getRefRequired(param);
  return required === false;
}
