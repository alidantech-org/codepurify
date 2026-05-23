import type {
  RouteDefinition,
  RouteParameterMap,
  RouteSchemaInput,
  RouteResponseInput,
  RouteBodyInput,
  RouteParameterFieldValue,
} from '../../routes/route.types.js';
import type { CompilerContext } from '../compiler-context.js';
import type {
  InferredParameterComponent,
  InferredRequestBodyComponent,
  InferredResponseComponent,
  InferredRouteComponents,
} from './inferred-route-components.types.js';
import type { VersionDefaults } from '../../version/version-contract.types.js';
import type { VersionContract } from '../../version/version-contract.types.js';
import { ContentType, ContentTypeInput } from '../../openapi/content-type.js';
import { getParameterName, getRequestBodyName, getResponseName, getDefaultResponseName } from '../../naming/component-name.js';
import { getRefRequired } from '../../validation/ref-usage-guards.js';
import { isEngineRef } from '../../validation/ref-guards.js';
import { isRefUsage } from '../../validation/ref-usage-guards.js';
import { isPropertyRef } from '../../validation/ref-guards.js';
import { collectQueryFieldsFromSchemaComponentValue, isRequiredForQuery } from './compile-route-parameters.js';

function isParameterMap(value: unknown): value is RouteParameterMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isEngineRef(value)) return false;
  if (isRefUsage(value)) return false;

  const obj = value as Record<string, unknown>;
  const values = Object.values(obj);

  // Empty map is valid
  if (values.length === 0) return true;

  // All values must be PropertyRef or RefUsage<PropertyRef>
  return values.every((field) => isPropertyRef(field) || (isRefUsage(field) && isPropertyRef(field.ref)));
}

export function inferRouteComponents(
  route: RouteDefinition,
  pathParams: RouteParameterMap | undefined,
  resourceKey?: string,
  defaultResponses?: Record<number, RouteResponseInput>,
  versionDefaults?: VersionDefaults,
  context?: CompilerContext,
  contract?: VersionContract,
): InferredRouteComponents {
  const components: InferredRouteComponents = {
    parameters: new Map(),
    requestBodies: new Map(),
    responses: new Map(),
  };

  // Infer path parameters from top-level route path params
  if (pathParams) {
    for (const [name, param] of Object.entries(pathParams)) {
      const componentName = getParameterName(name, 'path', resourceKey, route.operationId);
      const inferred: InferredParameterComponent = {
        name: componentName,
        parameterName: name,
        in: 'path',
        required: true, // Path params are always required
        schema: param,
        resourceKey,
        operationId: route.operationId,
        origin: 'path',
        property: name,
      };
      components.parameters.set(componentName, inferred);
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
        origin: 'path',
        property: name,
      };
      components.parameters.set(componentName, inferred);
    }
  }

  if (route.query) {
    // Query can be a ComponentRef/RefUsage<ComponentRef> (expanded to individual fields)
    // or a RouteParameterMap (individual property refs)
    // For ComponentRef queries, expand to individual fields and infer parameter components
    if (isRefUsage(route.query) || isEngineRef(route.query)) {
      const expandedFields = collectQueryFieldsFromSchemaComponentValue(route.query, contract);
      for (const collectedField of expandedFields) {
        const componentName = getParameterName(collectedField.name, 'query', resourceKey, route.operationId, collectedField.shared);
        const inferred: InferredParameterComponent = {
          name: componentName,
          parameterName: collectedField.name,
          in: 'query',
          required: collectedField.required,
          schema: collectedField.field,
          resourceKey,
          operationId: route.operationId,
          sourceSchema: collectedField.sourceSchema,
          sourceSchemaRef: collectedField.sourceSchemaRef,
          inheritedFrom: collectedField.inheritedFrom,
          inheritedFromRef: collectedField.inheritedFromRef,
          fromModel: collectedField.fromModel,
          fromModelRef: collectedField.fromModelRef,
          origin: collectedField.origin,
          shared: collectedField.shared,
          entity: collectedField.entity,
          property: collectedField.property,
        };

        // Deduplicate: if component exists, verify it matches
        if (components.parameters.has(componentName)) {
          const existing = components.parameters.get(componentName)!;
          if (existing.in !== inferred.in || existing.required !== inferred.required) {
            throw new Error(
              `Parameter component "${componentName}" already exists with different definition (in: ${existing.in}, required: ${existing.required}) vs (in: ${inferred.in}, required: ${inferred.required})`,
            );
          }
          // Reuse existing component
        } else {
          components.parameters.set(componentName, inferred);
        }
      }
    } else if (isParameterMap(route.query)) {
      for (const [name, param] of Object.entries(route.query)) {
        const componentName = getParameterName(name, 'query', resourceKey, route.operationId);
        const inferred: InferredParameterComponent = {
          name: componentName,
          parameterName: name,
          in: 'query',
          required: isRequiredForQuery(param),
          schema: param,
          resourceKey,
          operationId: route.operationId,
          origin: 'inline',
          property: name,
        };

        // Deduplicate: if component exists, verify it matches
        if (components.parameters.has(componentName)) {
          const existing = components.parameters.get(componentName)!;
          if (existing.in !== inferred.in || existing.required !== inferred.required) {
            throw new Error(
              `Parameter component "${componentName}" already exists with different definition (in: ${existing.in}, required: ${existing.required}) vs (in: ${inferred.in}, required: ${inferred.required})`,
            );
          }
          // Reuse existing component
        } else {
          components.parameters.set(componentName, inferred);
        }
      }
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
