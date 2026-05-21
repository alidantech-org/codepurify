export function expressPathToOpenApi(path: string): string {
  const converted = path.replace(/:(\w+)/g, '{$1}').replace(/\/+/g, '/');

  if (converted.length > 1 && converted.endsWith('/')) {
    return converted.slice(0, -1);
  }

  return converted;
}
