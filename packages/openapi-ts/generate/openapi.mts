import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';
import yaml from 'js-yaml';
import SwaggerParser from '@apidevtools/swagger-parser';

import { v2Contract } from '../../src/routes/v1/version.contract.js';
import {
  type VersionContractDefinition,
  type ContractDefinition,
  type RouteDefinition,
  type ComponentRef,
  type ConcreteSchemaDefinition,
  type PartialSchemaDefinition,
  type PickSchemaDefinition,
  type OmitSchemaDefinition,
  AccessLevel,
  type SchemaRef,
  type ParameterRef,
  type RequestBodyRef,
  type ResponseRef,
  type SdkSchemaMetadata,
  type SdkSchemaKind,
  type SdkDtoPlacement,
} from '../../src/lib/contracts/types.js';
import {
  OUTPUT_FOLDER,
  OUTPUT_FILE_PREFIX,
  OUTPUT_FORMATS,
  OPENAPI_TARGET,
  SERVER_URL,
  SERVER_DESCRIPTION,
  REF_PATTERNS,
  MESSAGES,
  CONTENT_TYPES,
  DEBUG_FILE_PREFIX,
} from './openapi.constants.mjs';

// ─── Config ────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESOLVED_OUTPUT_FOLDER = path.resolve(process.cwd(), OUTPUT_FOLDER);

// ─── Types ─────────────────────────────────────────────────────────────────────

type SchemaMode = 'input' | 'output';

type OpenApiSchemaRef = {
  $ref: string;
};

// ─── Schema resolution ─────────────────────────────────────────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOpenApiSchemaRef(value: unknown): value is OpenApiSchemaRef {
  return isPlainObject(value) && typeof value.$ref === 'string';
}

function isComponentRef(value: unknown): value is ComponentRef<any, string> {
  return isPlainObject(value) && typeof value.bucket === 'string' && typeof value.ref === 'string';
}

function isConcreteSchemaDefinition(value: unknown): value is ConcreteSchemaDefinition {
  return (
    isPlainObject(value) && 'type' in value && (value as any).type === 'schema' && 'schema' in value && isZodSchema((value as any).schema)
  );
}

function isPartialSchemaDefinition(value: unknown): value is PartialSchemaDefinition {
  return isPlainObject(value) && 'type' in value && (value as any).type === 'partial';
}

function isPickSchemaDefinition(value: unknown): value is PickSchemaDefinition {
  return isPlainObject(value) && 'type' in value && (value as any).type === 'pick';
}

function isOmitSchemaDefinition(value: unknown): value is OmitSchemaDefinition {
  return isPlainObject(value) && 'type' in value && (value as any).type === 'omit';
}

function isZodSchema(value: unknown): value is z.ZodTypeAny {
  return isPlainObject(value) && typeof (value as any).safeParse === 'function' && '_def' in value;
}

function toOpenApiRef(componentRef: SchemaRef): OpenApiSchemaRef {
  return { $ref: `${REF_PATTERNS.schemas}${componentRef.ref}` };
}

function toResponseRef(componentRef: ResponseRef): OpenApiSchemaRef {
  return { $ref: `${REF_PATTERNS.responses}${componentRef.ref}` };
}

function toParameterRef(componentRef: ParameterRef): OpenApiSchemaRef {
  return { $ref: `${REF_PATTERNS.parameters}${componentRef.ref}` };
}

function toRequestBodyRef(componentRef: RequestBodyRef): OpenApiSchemaRef {
  return { $ref: `${REF_PATTERNS.requestBodies}${componentRef.ref}` };
}

function zodToSchema(schema: z.ZodTypeAny, mode: SchemaMode = 'output'): unknown {
  const zodWithJsonSchema = z as typeof z & {
    toJSONSchema?: (
      schema: z.ZodTypeAny,
      options?: {
        target?: 'draft-7' | 'draft-07' | 'draft-2020-12' | 'openapi-3.0' | 'openapi-3.1';
        io?: 'input' | 'output';
        unrepresentable?: 'throw' | 'any';
        cycles?: 'ref' | 'throw';
        reused?: 'ref' | 'inline';
      },
    ) => unknown;
  };

  if (typeof zodWithJsonSchema.toJSONSchema !== 'function') {
    throw new Error(
      [
        'z.toJSONSchema is not available.',
        'Your generator requires Zod v4 JSON Schema support.',
        'Upgrade zod or add a zod-to-json-schema converter.',
      ].join(' '),
    );
  }

  const jsonSchema = zodWithJsonSchema.toJSONSchema(schema, {
    target: OPENAPI_TARGET,
    io: mode,
    unrepresentable: 'any',
    cycles: 'ref',
    reused: 'inline',
  });

  return fixIntegerConstraints(jsonSchema);
}

function fixIntegerConstraints(schema: unknown): unknown {
  if (!isPlainObject(schema)) return schema;

  const obj = schema as Record<string, unknown>;

  // Fix exclusiveMinimum: 0 to minimum: 1 for integers
  if (obj.type === 'integer' && obj.exclusiveMinimum === 0) {
    delete obj.exclusiveMinimum;
    obj.minimum = 1;
  }

  // Fix exclusiveMaximum: 0 to maximum: -1 for integers (if needed)
  if (obj.type === 'integer' && obj.exclusiveMaximum === 0) {
    delete obj.exclusiveMaximum;
    obj.maximum = -1;
  }

  // Fix tuple arrays: convert items array to prefixItems (OpenAPI 3.1)
  if (obj.type === 'array' && Array.isArray(obj.items)) {
    obj.prefixItems = obj.items;
    delete obj.items;
  }

  // Recursively fix nested objects
  for (const key of Object.keys(obj)) {
    if (key === 'properties' && isPlainObject(obj[key])) {
      const props = obj[key] as Record<string, unknown>;
      for (const propKey of Object.keys(props)) {
        props[propKey] = fixIntegerConstraints(props[propKey]);
      }
    } else if (key === 'items' && isPlainObject(obj[key])) {
      obj[key] = fixIntegerConstraints(obj[key]);
    } else if (key === 'prefixItems' && Array.isArray(obj[key])) {
      obj[key] = (obj[key] as unknown[]).map((item) => fixIntegerConstraints(item));
    } else if (key === 'additionalProperties' && isPlainObject(obj[key])) {
      obj[key] = fixIntegerConstraints(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key] = (obj[key] as unknown[]).map((item) => fixIntegerConstraints(item));
    }
  }

  return obj;
}

function resolveSchema(schema: unknown, mode: SchemaMode = 'output', components?: VersionContractDefinition['components']): unknown {
  if (schema === undefined || schema === null) return undefined;

  if (isOpenApiSchemaRef(schema)) return schema;
  if (isComponentRef(schema)) {
    if (schema.bucket === 'schemas') {
      return toOpenApiRef(schema as SchemaRef);
    } else if (schema.bucket === 'responses') {
      return toResponseRef(schema as ResponseRef);
    } else if (schema.bucket === 'parameters') {
      return toParameterRef(schema as ParameterRef);
    } else if (schema.bucket === 'requestBodies') {
      return toRequestBodyRef(schema as RequestBodyRef);
    }
  }

  if (isConcreteSchemaDefinition(schema)) {
    let openapiSchema = zodToSchema(schema.schema, mode) as Record<string, unknown>;

    // Apply propertyRefs if present
    if (schema.propertyRefs && isPlainObject(openapiSchema) && 'properties' in openapiSchema) {
      const properties = openapiSchema.properties as Record<string, unknown>;
      for (const [propName, propRef] of Object.entries(schema.propertyRefs)) {
        properties[propName] = resolvePropertyRef(propRef);
      }
    }

    return openapiSchema;
  }

  if (isPartialSchemaDefinition(schema)) {
    // Expand partial schema from base
    if (components?.schemas && schema.partialOf in components.schemas) {
      const baseSchema = components.schemas[schema.partialOf];
      const baseOpenapi = resolveSchema(baseSchema, mode, components) as Record<string, unknown>;

      if (isPlainObject(baseOpenapi) && 'properties' in baseOpenapi) {
        const properties = baseOpenapi.properties as Record<string, unknown>;
        const required = (baseOpenapi.required as string[]) || [];

        // Make all properties optional by removing from required
        const partialProps: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(properties)) {
          partialProps[key] = value;
        }

        return {
          type: 'object',
          properties: partialProps,
          required: [],
          additionalProperties: baseOpenapi.additionalProperties,
        };
      }
    }
    return { type: 'object', additionalProperties: true };
  }

  if (isPickSchemaDefinition(schema)) {
    // Expand pick schema from base
    if (components?.schemas && schema.base in components.schemas) {
      const baseSchema = components.schemas[schema.base];
      const baseOpenapi = resolveSchema(baseSchema, mode, components) as Record<string, unknown>;

      if (isPlainObject(baseOpenapi) && 'properties' in baseOpenapi) {
        const properties = baseOpenapi.properties as Record<string, unknown>;
        const required = (baseOpenapi.required as string[]) || [];

        // Pick only the specified properties
        const pickProps: Record<string, unknown> = {};
        const pickRequired: string[] = [];
        for (const key of schema.pick) {
          if (key in properties) {
            pickProps[key] = properties[key];
            if (required.includes(key)) {
              pickRequired.push(key);
            }
          }
        }

        return {
          type: 'object',
          properties: pickProps,
          required: pickRequired,
          additionalProperties: baseOpenapi.additionalProperties,
        };
      }
    }
    return { type: 'object', additionalProperties: true };
  }

  if (isOmitSchemaDefinition(schema)) {
    // Expand omit schema from base
    if (components?.schemas && schema.base in components.schemas) {
      const baseSchema = components.schemas[schema.base];
      const baseOpenapi = resolveSchema(baseSchema, mode, components) as Record<string, unknown>;

      if (isPlainObject(baseOpenapi) && 'properties' in baseOpenapi) {
        const properties = baseOpenapi.properties as Record<string, unknown>;
        const required = (baseOpenapi.required as string[]) || [];

        // Omit the specified properties
        const omitProps: Record<string, unknown> = {};
        const omitRequired: string[] = [];
        for (const [key, value] of Object.entries(properties)) {
          if (!schema.omit.includes(key)) {
            omitProps[key] = value;
            if (required.includes(key)) {
              omitRequired.push(key);
            }
          }
        }

        return {
          type: 'object',
          properties: omitProps,
          required: omitRequired,
          additionalProperties: baseOpenapi.additionalProperties,
        };
      }
    }
    return { type: 'object', additionalProperties: true };
  }

  if (isZodSchema(schema)) return zodToSchema(schema, mode);

  if (isPlainObject(schema) && 'schema' in schema) {
    const wrapped = (schema as any).schema;

    if (isComponentRef(wrapped)) {
      if (wrapped.bucket === 'schemas') {
        return toOpenApiRef(wrapped as SchemaRef);
      } else if (wrapped.bucket === 'responses') {
        return toResponseRef(wrapped as ResponseRef);
      } else if (wrapped.bucket === 'parameters') {
        return toParameterRef(wrapped as ParameterRef);
      } else if (wrapped.bucket === 'requestBodies') {
        return toRequestBodyRef(wrapped as RequestBodyRef);
      }
    }
    if (isOpenApiSchemaRef(wrapped)) {
      return wrapped;
    }

    if (isConcreteSchemaDefinition(wrapped)) return resolveSchema(wrapped, mode, components);
    if (isZodSchema(wrapped)) return zodToSchema(wrapped, mode);

    return resolveSchema(wrapped, mode, components);
  }

  return schema;
}

function resolvePropertyRef(propRef: unknown): unknown {
  if (isComponentRef(propRef)) {
    return toOpenApiRef(propRef as SchemaRef);
  }

  if (isPlainObject(propRef)) {
    const refObj = propRef as Record<string, unknown>;

    // Handle array type with item refs
    if (refObj.type === 'array' && 'items' in refObj && isComponentRef(refObj.items)) {
      return {
        type: 'array',
        items: toOpenApiRef(refObj.items as SchemaRef),
      };
    }

    // Handle nullable type with schema ref
    if (refObj.type === 'nullable' && 'schema' in refObj && isComponentRef(refObj.schema)) {
      return {
        anyOf: [toOpenApiRef(refObj.schema as SchemaRef), { type: 'null' }],
      };
    }

    // Handle nullable-array type
    if (refObj.type === 'nullable-array' && 'items' in refObj && isComponentRef(refObj.items)) {
      return {
        anyOf: [
          {
            type: 'array',
            items: toOpenApiRef(refObj.items as SchemaRef),
          },
          { type: 'null' },
        ],
      };
    }
  }

  return propRef;
}

// ─── SDK metadata validation ───────────────────────────────────────────────────

function validateSdkMetadata(metadata: SdkSchemaMetadata | undefined, schemaName: string): void {
  if (!metadata) return;

  // Validate kind
  if (metadata.kind && !['primitive', 'model', 'dto', 'enum', 'skip'].includes(metadata.kind)) {
    throw new Error(`Schema '${schemaName}': Invalid sdk.kind '${metadata.kind}'. Must be one of: primitive, model, dto, enum, skip`);
  }

  // Validate domain format (lower_snake_case)
  if (metadata.domain && !/^[a-z][a-z0-9_]*$/.test(metadata.domain)) {
    throw new Error(`Schema '${schemaName}': sdk.domain '${metadata.domain}' must be lower_snake_case`);
  }

  // Validate group format (lower_snake_case)
  if (metadata.group && !/^[a-z][a-z0-9_]*$/.test(metadata.group)) {
    throw new Error(`Schema '${schemaName}': sdk.group '${metadata.group}' must be lower_snake_case`);
  }

  // Validate operation format (lower_snake_case)
  if (metadata.operation && !/^[a-z][a-z0-9_]*$/.test(metadata.operation)) {
    throw new Error(`Schema '${schemaName}': sdk.operation '${metadata.operation}' must be lower_snake_case`);
  }

  // Validate placement
  if (metadata.placement && !['operation', 'group-shared', 'global-shared'].includes(metadata.placement)) {
    throw new Error(
      `Schema '${schemaName}': Invalid sdk.placement '${metadata.placement}'. Must be one of: operation, group-shared, global-shared`,
    );
  }

  // Validate consistency rules
  if (metadata.kind === 'model' && !metadata.domain) {
    throw new Error(`Schema '${schemaName}': sdk.kind='model' requires sdk.domain`);
  }

  if (metadata.kind === 'enum' && !metadata.domain) {
    throw new Error(`Schema '${schemaName}': sdk.kind='enum' should have sdk.domain`);
  }

  if (metadata.operation && !metadata.group) {
    throw new Error(`Schema '${schemaName}': sdk.operation requires sdk.group`);
  }
}

function validateRouteSdkMetadata(route: RouteDefinition, groupName: string): void {
  if (!route.sdk) return;

  const sdk = route.sdk;

  // Validate group format (lower_snake_case)
  if (sdk.group && !/^[a-z][a-z0-9_]*$/.test(sdk.group)) {
    throw new Error(`Route '${route.operationId}': sdk.group '${sdk.group}' must be lower_snake_case`);
  }

  // Validate operation format (lower_snake_case)
  if (sdk.operation && !/^[a-z][a-z0-9_]*$/.test(sdk.operation)) {
    throw new Error(`Route '${route.operationId}': sdk.operation '${sdk.operation}' must be lower_snake_case`);
  }

  // Default group to contract group if not specified
  const effectiveGroup = sdk.group ?? groupName;

  // Default operation to snake_case(operationId) if not specified
  const effectiveOperation = sdk.operation ?? toSnakeCase(route.operationId);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function emitSdkExtensions(metadata: SdkSchemaMetadata | undefined): Record<string, string | boolean> {
  const extensions: Record<string, string | boolean> = {};

  if (!metadata) return extensions;

  if (metadata.kind) extensions['x-sdk-kind'] = metadata.kind;
  if (metadata.domain) extensions['x-sdk-domain'] = metadata.domain;
  if (metadata.group) extensions['x-sdk-group'] = metadata.group;
  if (metadata.operation) extensions['x-sdk-operation'] = metadata.operation;
  if (metadata.shared !== undefined) extensions['x-sdk-shared'] = metadata.shared;
  if (metadata.placement) extensions['x-sdk-placement'] = metadata.placement;
  if (metadata.className) extensions['x-sdk-class-name'] = metadata.className;
  if (metadata.fileName) extensions['x-sdk-file-name'] = metadata.fileName;
  if (metadata.skip !== undefined) extensions['x-sdk-skip'] = metadata.skip;

  return extensions;
}

function emitRouteSdkExtensions(sdk: RouteDefinition['sdk'], groupName: string): Record<string, string> {
  const extensions: Record<string, string> = {};

  if (!sdk) return extensions;

  const effectiveGroup = sdk.group ?? groupName;
  const effectiveOperation = sdk.operation ?? undefined; // Don't default here, let generator handle it

  if (effectiveGroup) extensions['x-sdk-group'] = effectiveGroup;
  if (sdk.operation) extensions['x-sdk-operation'] = sdk.operation;
  if (sdk.name) extensions['x-sdk-name'] = sdk.name;
  if (sdk.skip !== undefined) extensions['x-sdk-skip'] = String(sdk.skip);

  return extensions;
}

// ─── Component conversion ───────────────────────────────────────────────────────

function convertComponents(components: VersionContractDefinition['components']): Record<string, unknown> {
  const openapiComponents: Record<string, unknown> = {};

  // Convert schemas
  if (components.schemas) {
    const schemas: Record<string, unknown> = {};
    for (const [key, schemaDef] of Object.entries(components.schemas)) {
      // Validate SDK metadata
      validateSdkMetadata(schemaDef.sdk, key);

      const resolved = resolveSchema(schemaDef, 'output', components);

      // Emit x-sdk-* extensions at top level
      const extensions = emitSdkExtensions(schemaDef.sdk);
      if (Object.keys(extensions).length > 0) {
        Object.assign(resolved as Record<string, unknown>, extensions);
      }

      schemas[key] = resolved;
    }
    openapiComponents.schemas = schemas;
  }

  // Convert parameters
  if (components.parameters) {
    const parameters: Record<string, unknown> = {};
    for (const [key, paramDef] of Object.entries(components.parameters)) {
      const resolved = resolveSchema(paramDef.schema, 'input');
      const p = paramDef as { name: string; in: string; schema: unknown; required?: boolean };
      const required = p.required !== undefined ? p.required : p.in === 'path';
      parameters[key] = {
        name: p.name,
        in: p.in,
        required,
        schema: resolved,
      };
    }
    openapiComponents.parameters = parameters;
  }

  // Convert request bodies
  if (components.requestBodies) {
    const requestBodies: Record<string, unknown> = {};
    for (const [key, bodyDef] of Object.entries(components.requestBodies)) {
      const resolved = resolveSchema(bodyDef.schema, 'input', components);
      requestBodies[key] = {
        required: bodyDef.required ?? false,
        content: {
          [CONTENT_TYPES.json]: {
            schema: resolved,
          },
        },
      };
    }
    openapiComponents.requestBodies = requestBodies;
  }

  // Convert responses
  if (components.responses) {
    const responses: Record<string, unknown> = {};
    for (const [key, responseDef] of Object.entries(components.responses)) {
      const resolved = responseDef.schema ? resolveSchema(responseDef.schema, 'output', components) : undefined;
      responses[key] = {
        description: responseDef.description,
        content: resolved
          ? {
              [CONTENT_TYPES.json]: {
                schema: resolved,
              },
            }
          : undefined,
      };
    }
    openapiComponents.responses = responses;
  }

  // Convert security schemes
  if (components.securitySchemes) {
    openapiComponents.securitySchemes = components.securitySchemes;
  }

  return openapiComponents;
}

// ─── Route conversion ─────────────────────────────────────────────────────────

function convertRouteToPathItem(
  route: RouteDefinition,
  group: ContractDefinition,
  components: VersionContractDefinition['components'],
): Record<string, unknown> {
  // Validate route SDK metadata
  validateRouteSdkMetadata(route, group.group);

  const pathItem: Record<string, unknown> = {
    summary: route.summary,
    description: route.description,
    tags: group.tags,
    security: route.access === AccessLevel.PUBLIC ? [] : [{ [route.auth ? route.auth.toLowerCase() + 'Auth' : 'bearerAuth']: [] }],
    parameters: [] as Array<Record<string, unknown>>,
    responses: {} as Record<string, unknown>,
  };

  if ('operationId' in route && route.operationId) {
    pathItem.operationId = route.operationId;
  }

  // Emit x-sdk-* extensions for routes
  const sdkExtensions = emitRouteSdkExtensions(route.sdk, group.group);
  if (Object.keys(sdkExtensions).length > 0) {
    Object.assign(pathItem, sdkExtensions);
  }

  // Add operation-level parameters (query, header, cookie) - NOT path parameters
  // Path parameters are handled at the Path Item level in generatePaths
  if (route.parameters) {
    for (const paramRef of route.parameters) {
      // Only add non-path parameters here
      const paramDef = components.parameters?.[paramRef.ref];
      if (paramDef && paramDef.in !== 'path') {
        (pathItem.parameters as Array<Record<string, unknown>>).push(toParameterRef(paramRef));
      }
    }
  }

  // Add request body
  if (route.requestBody) {
    pathItem.requestBody = toRequestBodyRef(route.requestBody);
  }

  // Add responses
  if (route.responses) {
    const responses: Record<string, unknown> = {};
    for (const [statusCode, responseRef] of Object.entries(route.responses)) {
      responses[statusCode] = toResponseRef(responseRef);
    }
    pathItem.responses = responses;
  }

  return pathItem;
}

function generatePaths(contract: VersionContractDefinition): Record<string, unknown> {
  const paths: Record<string, unknown> = {};

  for (const [groupName, groupContract] of Object.entries(contract.groups)) {
    const basePath = groupContract.basePath;

    for (const [routeName, route] of Object.entries(groupContract.routes)) {
      // Convert Express :param syntax to OpenAPI {param} syntax
      const fullPath = (basePath + route.path).replace(/:(\w+)/g, '{$1}');
      const method = route.method.toLowerCase();
      const pathItem = convertRouteToPathItem(route, groupContract, contract.components);

      const existingPath = paths[fullPath] as Record<string, unknown> | undefined;

      // Find matching path parameter pattern (convert both to OpenAPI syntax for comparison)
      let matchingPathParam: readonly any[] | undefined;
      if (groupContract.pathParameters) {
        for (const [pathPattern, paramRefs] of Object.entries(groupContract.pathParameters)) {
          const openapiPattern = pathPattern.replace(/:(\w+)/g, '{$1}');
          if (fullPath === openapiPattern || fullPath.includes(openapiPattern)) {
            matchingPathParam = paramRefs;
            break;
          }
        }
      }

      if (existingPath) {
        // Add operation to existing path
        existingPath[method] = pathItem;

        // Ensure path-level parameters exist
        if (!existingPath.parameters && matchingPathParam) {
          existingPath.parameters = matchingPathParam.map((ref) => toParameterRef(ref));
        }
      } else {
        // Create new path with path-level parameters
        const newPath: Record<string, unknown> = {
          [method]: pathItem,
        };

        // Add path-level parameters from matching pattern
        if (matchingPathParam) {
          newPath.parameters = matchingPathParam.map((ref) => toParameterRef(ref));
        }

        paths[fullPath] = newPath;
      }
    }
  }

  return paths;
}

// ─── Main generation ───────────────────────────────────────────────────────────

function generateOpenApiSpec(contract: VersionContractDefinition): Record<string, unknown> {
  return {
    openapi: contract.openapi,
    info: contract.info,
    servers: [
      {
        url: SERVER_URL,
        description: SERVER_DESCRIPTION,
      },
    ],
    paths: generatePaths(contract),
    components: convertComponents(contract.components),
    security: contract.components.securitySchemes
      ? Object.keys(contract.components.securitySchemes).map((scheme) => ({ [scheme]: [] }))
      : [],
  };
}

async function main(): Promise<void> {
  console.log(MESSAGES.generating);

  const openApiSpec = generateOpenApiSpec(v2Contract);

  // Ensure output folder exists
  if (!fs.existsSync(RESOLVED_OUTPUT_FOLDER)) {
    fs.mkdirSync(RESOLVED_OUTPUT_FOLDER, { recursive: true });
  }

  // Write contract debug file
  const debugPath = path.join(RESOLVED_OUTPUT_FOLDER, `${DEBUG_FILE_PREFIX}.json`);
  const debugContent = JSON.stringify(v2Contract, null, 2);
  fs.writeFileSync(debugPath, debugContent, 'utf-8');
  console.log(MESSAGES.generated(debugPath));

  // Write output files
  for (const format of OUTPUT_FORMATS) {
    const outputPath = path.join(RESOLVED_OUTPUT_FOLDER, `${OUTPUT_FILE_PREFIX}.${format}`);
    let content: string;

    if (format === 'json') {
      content = JSON.stringify(openApiSpec, null, 2);
    } else {
      content = yaml.dump(openApiSpec, { indent: 2, lineWidth: -1 });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(MESSAGES.generated(outputPath));
  }

  // Validate the generated spec
  try {
    const jsonPath = path.join(RESOLVED_OUTPUT_FOLDER, `${OUTPUT_FILE_PREFIX}.json`);
    const api = await SwaggerParser.validate(jsonPath);
    console.log(MESSAGES.validated(api.info.title, api.info.version));
  } catch (error) {
    console.error(MESSAGES.validationFailed, error);
    process.exit(1);
  }

  console.log(MESSAGES.done);
}

main().catch((error) => {
  console.error(MESSAGES.error, error);
  process.exit(1);
});
