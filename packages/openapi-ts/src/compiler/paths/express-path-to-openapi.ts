export function expressPathToOpenApi(path: string): string {
  return path.replace(/:(\w+)/g, '{$1}');
}
