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
    
    // Register completion provider for Codepurify files
    const provider = vscode.languages.registerCompletionItemProvider(
        { language: 'codepurify' },
        new CodepurifyCompletionProvider(variables)
    );

    context.subscriptions.push(provider);
}

function loadVariablesFromCSV(): VariableInfo[] {
    const csvPath = path.join(__dirname, '..', 'tempurify_v1_template_context_variables.csv');
    const fs = require('fs');
    const content = fs.readFileSync(csvPath, 'utf8');
    
    const variables: VariableInfo[] = [];
    const lines = content.split('\n');
    
    // Skip header and parse data
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
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
                type: type
            });
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

class CodepurifyCompletionProvider implements vscode.CompletionItemProvider {
    private variables: VariableInfo[];
    private keywords = [
        'if', 'else', 'each', 'raw',
        '/if', '/each', '/raw'
    ];

    constructor(variables: VariableInfo[]) {
        this.variables = variables;
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.CompletionItem[] {
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
        const start = line.lastIndexOf('~', position.character - 1);
        if (start === -1) return '';
        return line.substring(start + 1, position.character);
    }

    private isInCodepurifyExpression(linePrefix: string): boolean {
        const fullLine = linePrefix;
        const openTilde = fullLine.lastIndexOf('~');
        return openTilde !== -1;
    }

    private getVariableCompletions(linePrefix: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        const currentPath = this.extractCurrentPath(linePrefix);
        
        // Filter variables based on current path
        const matchingVariables = this.variables.filter(v => 
            v.path.startsWith(currentPath) || v.path.toLowerCase().includes(currentPath.toLowerCase())
        );

        for (const variable of matchingVariables) {
            const item = new vscode.CompletionItem(
                variable.path,
                vscode.CompletionItemKind.Variable
            );
            
            item.detail = variable.name;
            item.documentation = new vscode.MarkdownString(
                `**${variable.name}**\n\n${variable.description}\n\n*Type: ${variable.type}*`
            );
            
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
                const item = new vscode.CompletionItem(
                    keyword,
                    vscode.CompletionItemKind.Keyword
                );
                
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
