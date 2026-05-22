const COMMON_QUERY_PARAMS = new Set(['page', 'limit', 'sort', 'fields', 'populate', 'search']);

export function getParameterName(parameterName: string, location: 'path' | 'query', resourceKey?: string, operationId?: string): string {
  const suffix = location === 'path' ? 'PathParam' : 'QueryParam';
  const pascalName = toPascalCase(parameterName);

  // Common query params use global names
  if (location === 'query' && COMMON_QUERY_PARAMS.has(parameterName)) {
    return `${pascalName}${suffix}`;
  }

  // Resource-specific params include resource key
  if (resourceKey) {
    return `${toPascalCase(resourceKey)}${pascalName}${suffix}`;
  }

  return `${pascalName}${suffix}`;
}

export function getRequestBodyName(operationId: string): string {
  return `${toPascalCase(operationId)}RequestBody`;
}

export function getResponseName(operationId: string, status: number): string {
  return `${toPascalCase(operationId)}${status}Response`;
}

export function getDefaultResponseName(status: number): string {
  return `Default${status}Response`;
}

function toPascalCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/[^a-zA-Z0-9]/g, ' ') // Replace non-alphanumeric with space
    .split(' ')
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
