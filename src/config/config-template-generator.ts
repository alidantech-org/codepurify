import { defaultTempurifyConfigTemplate } from './default-config-template';

function toTsValue(value: unknown, indent = 2): string {
  const space = ' '.repeat(indent);
  const nextSpace = ' '.repeat(indent + 2);

  if (value === null) return 'null';
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((item) => `${nextSpace}${toTsValue(item, indent + 2)},`).join('\n')}\n${space}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);

    return `{\n${entries
      .map(([key, val]) => `${nextSpace}${key}: ${toTsValue(val, indent + 2)},`)
      .join('\n')}\n${space}}`;
  }

  return 'undefined';
}

export function generateTempurifyConfigFile(): string {
  return `import { defineTempurifyConfig } from 'tempurify';

export default defineTempurifyConfig(${toTsValue(defaultTempurifyConfigTemplate, 0)});
`;
}
