import * as vscode from 'vscode';
import * as path from 'path';

interface VariableInfo {
  path: string;
  name: string;
  description: string;
  type: string;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Codepurify extension is now active!');

  // Load variable definitions from CSV
  const variables = loadVariablesFromCSV();

  // Create diagnostic collection for syntax errors
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('codepurify');
  context.subscriptions.push(diagnosticCollection);

  // Register completion provider for all Codepurify language IDs
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    [
      { language: 'codepurify' },
      { language: 'codepurify-ts' },
      { language: 'codepurify-tsx' },
      { language: 'codepurify-md' },
      { language: 'codepurify-html' },
    ],
    new CodepurifyCompletionProvider(variables),
  );
  context.subscriptions.push(completionProvider);

  // Register syntax error diagnostic provider for all Codepurify language IDs
  const diagnosticProvider = new CodepurifyDiagnosticProvider(diagnosticCollection, variables);
  const disposable = vscode.workspace.onDidChangeTextDocument((event) => diagnosticProvider.validateDocument(event.document));
  context.subscriptions.push(disposable);

  // Validate all open documents on activation
  vscode.workspace.textDocuments.forEach((doc) => diagnosticProvider.validateDocument(doc));
}

function loadVariablesFromCSV(): VariableInfo[] {
  const csvPath = path.join(__dirname, '..', 'data', 'tempurify_v1_template_context_variables.csv');
  const fs = require('fs');

  // Check if CSV file exists
  if (!fs.existsSync(csvPath)) {
    console.warn(`CSV file not found at ${csvPath}. Variable completion will be disabled.`);
    return [];
  }

  let content: string;
  try {
    content = fs.readFileSync(csvPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read CSV file at ${csvPath}:`, error);
    return [];
  }

  const variables: VariableInfo[] = [];
  const lines = content.split('\n');

  // Skip header and parse data
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Simple CSV parsing (handles quoted values)
      const parts = parseCSVLine(line);
      if (parts.length >= 3) {
        const variablePath = parts[0];
        const name = parts[1];
        const description = parts[2];
        const type = parts[4] || 'unknown';

        variables.push({
          path: variablePath,
          name: name,
          description: description,
          type: type,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse CSV line ${i + 1}: ${line}`, error);
      // Continue with next line
    }
  }

  return variables;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

class CodepurifyDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private variables: VariableInfo[];
  private validPaths: Set<string>;
  private codepurifyLanguages = ['codepurify', 'codepurify-ts', 'codepurify-tsx', 'codepurify-md', 'codepurify-html'];

  constructor(diagnosticCollection: vscode.DiagnosticCollection, variables: VariableInfo[]) {
    this.diagnosticCollection = diagnosticCollection;
    this.variables = variables;
    this.validPaths = new Set(variables.map((v) => v.path));
  }

  validateDocument(document: vscode.TextDocument): void {
    // Only validate Codepurify language files
    if (!this.codepurifyLanguages.includes(document.languageId)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Find all Codepurify expressions (~ ... ~)
    const expressions = this.findCodepurifyExpressions(text);

    for (const expr of expressions) {
      const errors = this.validateExpression(expr.content, expr.range);
      diagnostics.push(...errors);
    }

    // Check for unmatched delimiters
    const delimiterErrors = this.validateDelimiters(text);
    diagnostics.push(...delimiterErrors);

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private findCodepurifyExpressions(text: string): Array<{ content: string; range: vscode.Range }> {
    const expressions: Array<{ content: string; range: vscode.Range }> = [];
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      let match: RegExpExecArray | null;

      // Find expressions in this line
      const regex = /\(~([^~]*?)~\)/g;
      while ((match = regex.exec(line)) !== null) {
        const startPos = new vscode.Position(lineIndex, match.index);
        const endPos = new vscode.Position(lineIndex, match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);

        expressions.push({
          content: match[1].trim(),
          range: range,
        });
      }
    }

    return expressions;
  }

  private validateExpression(content: string, range: vscode.Range): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Check for empty expressions
    if (!content) {
      const diagnostic = new vscode.Diagnostic(range, 'Empty Codepurify expression', vscode.DiagnosticSeverity.Warning);
      diagnostic.code = 'empty-expression';
      diagnostics.push(diagnostic);
      return diagnostics;
    }

    // Validate variable paths
    this.validateVariablePaths(content, range, diagnostics);

    return diagnostics;
  }

  private validateVariablePaths(content: string, range: vscode.Range, diagnostics: vscode.Diagnostic[]): void {
    const keywords = new Set([
      'if',
      'else',
      'each',
      'raw',
      'unless',
      'with',
      'as',
      'in',
      'and',
      'or',
      'not',
      'is',
      'true',
      'false',
      'null',
      'undefined',
    ]);

    const pathRegex = /\b[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)+\b/g;
    let match: RegExpExecArray | null;

    while ((match = pathRegex.exec(content)) !== null) {
      const variablePath = match[0];

      if (keywords.has(variablePath)) continue;

      if (!this.validPaths.has(variablePath)) {
        const diagnostic = new vscode.Diagnostic(range, `Unknown Codepurify variable: '${variablePath}'`, vscode.DiagnosticSeverity.Error);
        diagnostic.code = 'unknown-variable';
        diagnostics.push(diagnostic);
      }
    }
  }

  private validateDelimiters(text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Count opening and closing delimiters
      const openCount = (line.match(/\(~/g) || []).length;
      const closeCount = (line.match(/~\)/g) || []).length;

      if (openCount !== closeCount) {
        const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);
        const diagnostic = new vscode.Diagnostic(
          range,
          `Unmatched Codepurify delimiters. Found ${openCount} opening '(~' and ${closeCount} closing '~)'`,
          vscode.DiagnosticSeverity.Error,
        );
        diagnostic.code = 'unmatched-delimiters';
        diagnostics.push(diagnostic);
      }
    }

    return diagnostics;
  }
}

class CodepurifyCompletionProvider implements vscode.CompletionItemProvider {
  private variables: VariableInfo[];
  private keywords = [
    'if',
    'else',
    'each',
    'raw',
    'unless',
    'with',
    '/if',
    '/each',
    '/raw',
    '/unless',
    '/with',
    'as',
    'in',
    'not',
    'and',
    'or',
    'is',
  ];

  constructor(variables: VariableInfo[]) {
    this.variables = variables;
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const linePrefix = this.getLinePrefix(document, position);

    // Check if we're inside a Codepurify expression (~ ... ~)
    if (!this.isInCodepurifyExpression(linePrefix)) {
      return [];
    }

    const items: vscode.CompletionItem[] = [];

    // Provide variable completions
    const variableCompletions = this.getVariableCompletions(linePrefix);
    items.push(...variableCompletions);

    // Provide keyword completions for control flow
    const keywordCompletions = this.getKeywordCompletions(linePrefix);
    items.push(...keywordCompletions);

    return items;
  }

  private getLinePrefix(document: vscode.TextDocument, position: vscode.Position): string {
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);

    const openIndex = beforeCursor.lastIndexOf('(~');
    const closeIndex = beforeCursor.lastIndexOf('~)');

    if (openIndex === -1 || closeIndex > openIndex) return '';

    return beforeCursor.substring(openIndex + 2);
  }

  private isInCodepurifyExpression(linePrefix: string): boolean {
    return linePrefix.length > 0;
  }

  private getVariableCompletions(linePrefix: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const currentPath = this.extractCurrentPath(linePrefix);

    // Filter variables based on current path
    const matchingVariables = this.variables.filter(
      (v) => v.path.startsWith(currentPath) || v.path.toLowerCase().includes(currentPath.toLowerCase()),
    );

    for (const variable of matchingVariables) {
      const item = new vscode.CompletionItem(variable.path, vscode.CompletionItemKind.Variable);

      item.detail = variable.name;
      item.documentation = new vscode.MarkdownString(`**${variable.name}**\n\n${variable.description}\n\n*Type: ${variable.type}*`);

      // Determine if this is a nested property
      const pathParts = variable.path.split('.');
      if (pathParts.length > 1) {
        item.insertText = variable.path.substring(currentPath.length);
      }

      items.push(item);
    }

    return items;
  }

  private getKeywordCompletions(linePrefix: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const keyword of this.keywords) {
      if (keyword.toLowerCase().includes(linePrefix.toLowerCase())) {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);

        item.detail = `Codepurify keyword: ${keyword}`;
        item.insertText = keyword;

        items.push(item);
      }
    }

    return items;
  }

  private extractCurrentPath(linePrefix: string): string {
    // Extract the current variable path being typed
    // Remove trailing spaces and get the last word
    const trimmed = linePrefix.trim();
    const words = trimmed.split(/\s+/);
    return words[words.length - 1] || '';
  }
}

export function deactivate() {
  console.log('Codepurify extension is now deactivated');
}
