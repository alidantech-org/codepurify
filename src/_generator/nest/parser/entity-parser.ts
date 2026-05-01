import { Project } from 'ts-morph';

/**
 * Parsed entity field
 */
export interface ParsedEntityField {
  /** Field name */
  name: string;
  /** Field type string */
  type: string;
  /** Is field optional */
  optional: boolean;
  /** Is field readonly */
  readonly: boolean;
  /** Is field nullable */
  nullable: boolean;
  /** Is field an array */
  array: boolean;
}

/**
 * Parsed entity relation
 */
export interface ParsedEntityRelation {
  /** Relation name */
  name: string;
  /** Target entity type */
  targetType: string;
  /** Relation type */
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | 'unknown';
}

/**
 * Parsed entity type
 */
export interface ParsedEntityType {
  /** Interface name */
  interfaceName: string;
  /** Parsed fields */
  fields: ParsedEntityField[];
  /** Parsed relations */
  relations: ParsedEntityRelation[];
}

/**
 * Parse interface from *.types.ts file
 *
 * @param filePath - Path to the types file
 * @returns Promise<ParsedEntityType> - Parsed entity type
 * @throws Error if interface parsing fails
 */
export async function parseEntityTypesFile(filePath: string): Promise<ParsedEntityType> {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  // Find exported interface (e.g., IApp)
  const interfaces = sourceFile.getInterfaces().filter((i) => i.isExported());

  if (interfaces.length === 0) {
    throw new Error(`No exported interface found in ${filePath}`);
  }
  if (interfaces.length > 1) {
    throw new Error(`Multiple exported interfaces found in ${filePath}`);
  }

  const interfaceDecl = interfaces[0];
  const interfaceName = interfaceDecl.getName();

  const parsedType: ParsedEntityType = {
    interfaceName,
    fields: [],
    relations: [],
  };

  // Parse interface properties
  const properties = interfaceDecl.getProperties();

  for (const prop of properties) {
    const field = parseEntityField(prop);
    parsedType.fields.push(field);

    // Check if this field is a relation
    const relation = detectRelation(field, sourceFile);
    if (relation) {
      parsedType.relations.push(relation);
    }
  }

  return parsedType;
}

/**
 * Parse entity field from property declaration
 *
 * @param prop - Property declaration
 * @returns ParsedEntityField - Parsed field
 */
function parseEntityField(prop: any): ParsedEntityField {
  const name = prop.getName();
  const typeNode = prop.getTypeNode();
  const typeText = typeNode?.getText() || 'unknown';

  // Parse field characteristics
  const optional = prop.hasQuestionToken();
  const readonly = prop.isReadonly();

  // Detect nullable and array types
  const nullable = typeText.includes('null') || typeText.includes('undefined');
  const array = typeText.includes('[]') || typeText.includes('Array<');

  // Clean up type text
  let cleanType = typeText;
  if (nullable) {
    cleanType = cleanType.replace(/\s*\|\s*(null|undefined)/g, '');
  }
  if (array) {
    cleanType = cleanType.replace(/\[\]/g, '').replace(/Array<\s*(.*?)\s*>/g, '$1');
  }
  cleanType = cleanType.trim();

  return {
    name,
    type: cleanType,
    optional,
    readonly,
    nullable,
    array,
  };
}

/**
 * Detect if a field represents a relation
 *
 * @param field - Parsed field
 * @param sourceFile - Source file for import analysis
 * @returns ParsedEntityRelation | null - Relation if detected
 */
function detectRelation(field: ParsedEntityField, sourceFile: any): ParsedEntityRelation | null {
  // Skip primitive types
  const primitiveTypes = ['string', 'number', 'boolean', 'Date', 'any', 'unknown'];
  if (primitiveTypes.includes(field.type)) {
    return null;
  }

  // Check if type is imported (likely another entity)
  const imports = sourceFile.getImportDeclarations();
  const importedTypes = new Set<string>();

  for (const importDecl of imports) {
    const namedImports = importDecl.getNamedImports();
    for (const namedImport of namedImports) {
      importedTypes.add(namedImport.getName());
    }
  }

  // If the type is imported, it's likely a relation
  if (importedTypes.has(field.type)) {
    // Determine relation type based on field characteristics
    let relationType: ParsedEntityRelation['relationType'] = 'unknown';

    if (field.array) {
      relationType = 'one-to-many';
    } else if (field.nullable) {
      relationType = 'many-to-one';
    } else if (field.readonly) {
      relationType = 'many-to-one';
    } else {
      relationType = 'unknown';
    }

    return {
      name: field.name,
      targetType: field.type,
      relationType,
    };
  }

  return null;
}
