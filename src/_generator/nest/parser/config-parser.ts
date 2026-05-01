import { readFile } from 'node:fs/promises';
import { Project } from 'ts-morph';

/**
 * Parsed entity configuration
 */
export interface ParsedEntityConfig {
  /** Fields export name */
  fieldsExportName: string;
  /** Meta export name */
  metaExportName: string;
  /** Database export name */
  dbExportName: string;
  /** Relation keys from APP_FIELDS.relation.keys */
  relationKeys: string[];
  /** Parsed metadata from APP_META */
  meta: {
    name: string;
    module: string;
    schema: string;
    tableName: string;
    route: string;
    entityClass: string;
  };
}

/**
 * Parse entity configuration file to extract exported constants
 *
 * @param filePath - Path to the config file
 * @returns Promise<ParsedEntityConfig> - Parsed configuration
 * @throws Error if required exports are missing
 */
export async function parseEntityConfigFile(filePath: string): Promise<ParsedEntityConfig> {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const config: ParsedEntityConfig = {
    fieldsExportName: '',
    metaExportName: '',
    dbExportName: '',
    relationKeys: [],
    meta: {
      name: '',
      module: '',
      schema: '',
      tableName: '',
      route: '',
      entityClass: '',
    },
  };

  // Find APP_FIELDS export
  const fieldsExports = sourceFile.getVariableDeclarations().filter((v) => v.getName().toUpperCase().includes('FIELDS') && v.isExported());

  if (fieldsExports.length === 0) {
    throw new Error(`Missing APP_FIELDS export in ${filePath}`);
  }
  if (fieldsExports.length > 1) {
    throw new Error(`Multiple APP_FIELDS exports found in ${filePath}`);
  }

  config.fieldsExportName = fieldsExports[0].getName();

  // Find APP_META export
  const metaExports = sourceFile.getVariableDeclarations().filter((v) => v.getName().toUpperCase().includes('META') && v.isExported());

  if (metaExports.length === 0) {
    throw new Error(`Missing APP_META export in ${filePath}`);
  }
  if (metaExports.length > 1) {
    throw new Error(`Multiple APP_META exports found in ${filePath}`);
  }

  config.metaExportName = metaExports[0].getName();

  // Find APP_DB export
  const dbExports = sourceFile.getVariableDeclarations().filter((v) => v.getName().toUpperCase().includes('DB') && v.isExported());

  if (dbExports.length === 0) {
    throw new Error(`Missing APP_DB export in ${filePath}`);
  }
  if (dbExports.length > 1) {
    throw new Error(`Multiple APP_DB exports found in ${filePath}`);
  }

  config.dbExportName = dbExports[0].getName();

  // Parse APP_FIELDS.relation.keys
  const fieldsVar = fieldsExports[0];
  const fieldsInitializer = fieldsVar.getInitializer();
  if (fieldsInitializer) {
    // Try to extract relation.keys from the object literal
    const content = sourceFile.getFullText();
    const relationKeysMatch = new RegExp(
      `${config.fieldsExportName}\\s*=\\s*\\{[^}]*relation\\s*:\\s*\\{[^}]*keys\\s*:\\s*\\[([^\\]]+)\\]`,
      's',
    ).exec(content);

    if (relationKeysMatch) {
      const keysContent = relationKeysMatch[1];
      // Extract array elements (simple approach)
      const keys = keysContent
        .split(',')
        .map((k) => k.trim().replace(/['"]/g, ''))
        .filter((k) => k.length > 0);
      config.relationKeys = keys;
    }
  }

  // Parse APP_META properties
  const metaVar = metaExports[0];
  const metaInitializer = metaVar.getInitializer();
  if (metaInitializer && metaInitializer.getKindName() === 'ObjectLiteralExpression') {
    const metaObj = metaInitializer as any;
    const properties = ['name', 'module', 'schema', 'tableName', 'route', 'entityClass'];

    for (const prop of properties) {
      const propAssignment = metaObj.getProperty(prop);
      if (propAssignment) {
        const value = propAssignment.getInitializer()?.getText()?.replace(/['"]/g, '') || '';
        config.meta[prop as keyof typeof config.meta] = value;
      }
    }
  }

  // Validate required meta properties
  for (const [key, value] of Object.entries(config.meta)) {
    if (!value) {
      throw new Error(`Missing required property '${key}' in APP_META in ${filePath}`);
    }
  }

  return config;
}
