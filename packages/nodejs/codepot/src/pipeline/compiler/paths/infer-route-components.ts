import type { CompilerContext } from '../compiler-context';
import type { InferredParameterComponent, InferredQueryParameterSchema, InferredRouteComponents } from './inferred-route-components.types';
import type { VersionContract, VersionDefaults } from '@/contract/version/version-contract.types';

import { isRefUsage } from '@/pipeline/validation/ref-usage-guards';
import { isEngineRef, isPropertyRef } from '@/pipeline/validation/ref-guards';
import { collectQueryFieldsFromSchemaComponentValue, isRequiredForQuery } from './compile-route-parameters';
import { ContentType } from '@/app/runtime/output/output.constants';
import { RefKind } from '@/contract/refs/ref-kind';
import { ModelRef } from '@/contract/refs/ref.types';
import { RouteParameterMap, RouteDefinition, RouteResponseInput, RouteBodyInput, RouteSchemaInput } from '@/contract/routes/route.types';
import { ContentTypeInput } from '@/pipeline/targets/openapi/options/content-type';
import { getParameterName, getRequestBodyName, getResponseName, getDefaultResponseName } from '@/utils/naming/component-name';

function getParameterIdentityKey(param: {
  readonly name: string;
  readonly in: 'path' | 'query';
  readonly resourceKey?: string;
  readonly source?: { shared?: boolean };
}): string {
  const parts: string[] = [param.in];

  if (param.source?.shared) {
    parts.push('shared');
  } else if (param.resourceKey) {
    parts.push('resource', param.resourceKey);
  }

  parts.push(param.name);
  return parts.join(':');
}

function isParameterMap(value: unknown): value is RouteParameterMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (isEngineRef(value)) return false;
  if (isRefUsage(value)) return false;

  const values = Object.values(value as Record<string, unknown>);

  if (values.length === 0) return true;

  return values.every((field) => {
    return isPropertyRef(field) || (isRefUsage(field) && isPropertyRef(field.ref));
  });
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

  if (pathParams) {
    for (const [name, param] of Object.entries(pathParams)) {
      addInferredParameter(components, {
        name: getParameterName(name, 'path', resourceKey, route.operationId),
        parameterName: name,
        in: 'path',
        required: true,
        schema: param,
        resourceKey,
        operationId: route.operationId,
        source: { origin: 'path' },
      });
    }
  }

  if (route.params) {
    for (const [name, param] of Object.entries(route.params)) {
      addInferredParameter(components, {
        name: getParameterName(name, 'path', resourceKey, route.operationId),
        parameterName: name,
        in: 'path',
        required: true,
        schema: param,
        resourceKey,
        operationId: route.operationId,
        source: { origin: 'path' },
      });
    }
  }

  if (route.query) {
    if (isRefUsage(route.query) || isEngineRef(route.query)) {
      const expandedFields = collectQueryFieldsFromSchemaComponentValue(route.query, contract);

      for (const collectedField of expandedFields) {
        addInferredParameter(components, {
          name: getParameterName(collectedField.name, 'query', resourceKey, route.operationId, collectedField.source),
          parameterName: collectedField.name,
          in: 'query',
          required: collectedField.required,
          schema: collectedField.field,
          resourceKey,
          operationId: route.operationId,
          source: collectedField.source,
        });
      }
    } else if (isParameterMap(route.query)) {
      for (const [name, param] of Object.entries(route.query)) {
        addInferredParameter(components, {
          name: getParameterName(name, 'query', resourceKey, route.operationId),
          parameterName: name,
          in: 'query',
          required: isRequiredForQuery(param),
          schema: param,
          resourceKey,
          operationId: route.operationId,
          source: { origin: 'inline' },
        });
      }
    }
  }

  if (route.body) {
    const componentName = getRequestBodyName(route.operationId || 'Unknown');
    const { schema, required, description, contentType } = extractBodySchema(route.body, versionDefaults);

    components.requestBodies.set(componentName, {
      name: componentName,
      required: required ?? true,
      schema,
      description,
      contentType,
      resourceKey,
      operationId: route.operationId || 'Unknown',
    });
  }

  if (route.response) {
    const componentName = getResponseName(route.operationId || 'Unknown', 200);
    const { schema, description, contentType, noContent } = extractResponseSchema(route.response, versionDefaults);

    components.responses.set(componentName, {
      name: componentName,
      status: 200,
      schema,
      description: description || 'Success',
      contentType: noContent ? undefined : contentType,
      resourceKey,
      operationId: route.operationId || 'Unknown',
      noContent,
    });
  }

  if (route.responses) {
    for (const [status, response] of Object.entries(route.responses)) {
      const statusCode = parseInt(status, 10);
      const componentName = getResponseName(route.operationId || 'Unknown', statusCode);
      const { schema, description, contentType, noContent } = extractResponseSchema(response, versionDefaults);

      components.responses.set(componentName, {
        name: componentName,
        status: statusCode,
        schema,
        description: description || `Response ${statusCode}`,
        contentType: noContent ? undefined : contentType,
        resourceKey,
        operationId: route.operationId || 'Unknown',
        noContent,
      });
    }
  }

  if (defaultResponses) {
    for (const [status, response] of Object.entries(defaultResponses)) {
      const statusCode = parseInt(status, 10);
      const componentName = getDefaultResponseName(statusCode);
      const { schema, description, contentType, noContent } = extractResponseSchema(response, versionDefaults);

      if (!components.responses.has(componentName)) {
        components.responses.set(componentName, {
          name: componentName,
          status: statusCode,
          schema,
          description: description || `Default ${statusCode} response`,
          contentType: noContent ? undefined : contentType,
          operationId: 'Default',
          noContent,
        });
      }
    }
  }

  return components;
}

function addInferredParameter(components: InferredRouteComponents, inferred: InferredParameterComponent): void {
  const componentName = inferred.name;

  if (components.parameters.has(componentName)) {
    const existing = components.parameters.get(componentName)!;
    assertSameParameterDefinition(existing, inferred);
    return;
  }

  components.parameters.set(componentName, inferred);
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
  if (typeof body === 'object' && body && 'schema' in body) {
    const objBody = body as {
      schema: RouteSchemaInput;
      required?: boolean;
      description?: string;
      contentType?: ContentTypeInput;
    };

    return {
      schema: objBody.schema,
      required: objBody.required,
      description: objBody.description,
      contentType: objBody.contentType ?? versionDefaults?.requestContentType ?? ContentType.json,
    };
  }

  return {
    schema: body as RouteSchemaInput,
    contentType: versionDefaults?.requestContentType ?? ContentType.json,
  };
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
  if (typeof response === 'object' && response && 'schema' in response) {
    const objResponse = response as {
      schema: RouteSchemaInput;
      description?: string;
      contentType?: ContentTypeInput;
    };

    return {
      schema: objResponse.schema,
      description: objResponse.description,
      contentType: objResponse.contentType ?? versionDefaults?.responseContentType ?? ContentType.json,
    };
  }

  if (typeof response === 'object' && response && 'kind' in response && response.kind === 'noContent') {
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

function assertSameParameterDefinition(existing: InferredParameterComponent, inferred: InferredParameterComponent): void {
  if (existing.in !== inferred.in) {
    throw new Error(`Parameter component "${existing.name}" already exists with different location (in: ${existing.in} vs ${inferred.in})`);
  }

  if (existing.required !== inferred.required) {
    throw new Error(
      `Parameter component "${existing.name}" already exists with different required (${existing.required} vs ${inferred.required})`,
    );
  }

  const existingRefId = getInferredSchemaRefId(existing.schema);
  const inferredRefId = getInferredSchemaRefId(inferred.schema);

  if (existingRefId !== inferredRefId) {
    throw new Error(
      `Parameter component "${existing.name}" already exists with different schema (existing ref: ${existingRefId}, new ref: ${inferredRefId})`,
    );
  }
}

function getInferredSchemaRefId(schema: InferredQueryParameterSchema): string | undefined {
  const ref = isRefUsage(schema) ? schema.ref : schema;

  if (isPropertyRef(ref)) return ref.id;
  if (isModelRef(ref)) return ref.id;

  return undefined;
}

function isModelRef(value: unknown): value is ModelRef {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'kind' in value &&
    value.kind === RefKind.model &&
    'modelKey' in value &&
    'fields' in value
  );
}
