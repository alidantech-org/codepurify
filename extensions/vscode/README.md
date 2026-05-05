# Codepurify Templates

VS Code extension for Codepurify template language with syntax highlighting, intelligent autocomplete, and real-time error validation.

## Features

- **Multi-Language Support**: Works with TypeScript, TSX, Markdown, and HTML files
- **Syntax Highlighting**: Full highlighting for `{! ... !}` template expressions
- **Intelligent Autocomplete**: Context-aware variable completion from CSV definitions
- **Real-time Validation**: Instant error highlighting for unknown variables and syntax errors
- **Control Flow Support**: Proper highlighting for `if`, `loop`, `raw` blocks
- **Comment Support**: `{!# comment #!}` syntax highlighting
- **Smart Delimiters**: Auto-closing `{!` and `!}` pairs

## Supported File Extensions

- `.code` - Standalone Codepurify templates
- `.codepurify` - Alternative extension for Codepurify templates

## Icon Theme

The extension includes a custom icon theme for Codepurify files:

### Installation

1. Install the Codepurify Templates extension
2. Open VS Code Settings
3. Navigate to **File Icon Theme**
4. Select **"Codepurify Icons"** from the dropdown

### Icons Included

- **Files**: `.code` and `.codepurify` files get custom Codepurify icons
- **Folders**: `codepurify`, `codepurify-templates`, `examples`, `examplets` folders get themed icons

### Alternative: Material Icon Theme

If you prefer Material Icon Theme, you can map Codepurify files to existing icons:

```json
{
  "material-icon-theme.files.associations": {
    "*.code": "template",
    "*.codepurify": "template"
  },
  "material-icon-theme.folders.associations": {
    "codepurify": "template",
    "codepurify-templates": "template"
  }
}
```

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Codepurify Templates"
4. Click Install

### Manual Installation (VSIX)

1. Download the latest `.vsix` file from [Releases](https://github.com/alidantech-org/codepurify/releases)
2. In VS Code: Extensions → "..." → "Install from VSIX..."
3. Select the downloaded `.vsix` file

## Syntax Examples

### Variables and Properties

```typescript
{
  !entity.names.casing.pascal!;
}
{
  !field.names.casing.camel!;
}
{
  !relation.target_entity.names.kebab!;
}
{
  !entity.names.singular.casing.snake!;
}
```

### Control Flow

```typescript
{! if field.flags.is_string !}
  @IsString()
{! /if !}

{! loop entity.fields.arrays.parts.items as field !}
  {! field.names.casing.camel !}: string;
{! /loop !}

{! raw !}
// This code will be output exactly as written
{! /raw !}
```

### Comments

```typescript
{!# This is a comment #!}
{!# Multi-line comment
   spanning multiple lines #!}
```

### Error Validation

The extension provides real-time validation:

✅ **Valid**: `{! entity.names.casing.camel !}`
❌ **Error**: `{! entity.names.casings.camel !}` - Unknown variable `casings`

✅ **Valid**: `{! if condition !} ... {! /if !}`
❌ **Error**: `{! if condition !}` - Unclosed control flow

## Autocomplete

The extension provides intelligent autocomplete for:

- **Variables**: All available variables from your template context
- **Properties**: Nested properties with dot notation
- **Keywords**: `if`, `loop`, `raw`, `else`, etc.
- **Snippets**: Common template patterns

Type `{!` inside any supported file to see available completions.

## Configuration

### Variable Definitions

The extension reads variable definitions from a CSV file. Place your `tempurify_v1_template_context_variables.csv` in the `data/` folder with the format:

```csv
path,name,description,type
entity.names.casing.camel,Camel Case,Camel case version of entity name,string
entity.fields.arrays.all,All Fields,Array of all field objects,array
```

### Theme Customization

Customize colors in your VS Code settings:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "keyword.control.codepurify",
        "settings": {
          "foreground": "#C586C0"
        }
      },
      {
        "scope": "variable.other.codepurify",
        "settings": {
          "foreground": "#4FC1FF"
        }
      },
      {
        "scope": "comment.block.codepurify",
        "settings": {
          "foreground": "#6A9955"
        }
      }
    ]
  }
}
```

## Grammar Scopes

- `keyword.control.codepurify` - Control flow keywords (`if`, `loop`, `/if`, `/loop`)
- `keyword.operator.word.codepurify` - Operators (`as`, `in`, `and`, `or`, `not`, `is`)
- `variable.other.path.codepurify` - Variable paths with dot notation
- `variable.other.identifier.codepurify` - Simple identifiers
- `comment.block.codepurify` - Template comments
- `meta.expression.codepurify` - Complete template expressions

## Development

### File Structure

```
codepurify-vscode/
├── package.json                    # Extension manifest
├── language-configuration.json     # Language configuration
├── language-configuration-*.json   # Multi-language configs
├── syntaxes/
│   ├── codepurify.tmLanguage.json  # Base grammar
│   ├── codepurify-ts.tmLanguage.json
│   ├── codepurify-tsx.tmLanguage.json
│   ├── codepurify-md.tmLanguage.json
│   └── codepurify-html.tmLanguage.json
├── snippets/
│   └── codepurify.json            # Code snippets
├── data/
│   └── tempurify_v1_template_context_variables.csv
└── src/
    └── extension.ts               # Extension logic
```

### Building and Testing

1. Clone the repository
2. Install dependencies: `npm install`
3. Compile: `npm run compile`
4. Test: Press `F5` to open Extension Development Host
5. Package: `vsce package`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Update grammar or add new features
4. Test thoroughly with various template files
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/alidantech-org/codepurify/issues)
- 💬 Feature requests: [GitHub Discussions](https://github.com/alidantech-org/codepurify/discussions)
- 📖 Documentation: [Codepurify Docs](https://github.com/alidantech-org/codepurify)

## Syntax Examples

### Variables

```typescript
{
  !entity.names.casing.pascal!;
}
{
  !field.names.casing.camel!;
}
{
  !relation.target_entity.names.kebab!;
}
```

### Control Flow

```typescript
{! if field.flags.is_string !}
  @IsString()
  {! /if !}

{! loop entity.fields.arrays.parts.items as field !}
  {! field.names.casing.camel !}: string;
{! /loop !}
```

### Comments

```typescript
{!# This is a comment #!}
{!# Multi-line comment
   spanning multiple lines #!}
```

## File Association

`.code` files are automatically associated with TypeScript, providing:

- TypeScript syntax highlighting
- JSX/TSX support
- IntelliSense for TypeScript code
- Proper indentation
- Comment toggling

## Theme Customization

Add to your VS Code settings to customize colors:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "keyword.control.codepurify",
        "settings": {
          "foreground": "#C586C0"
        }
      },
      {
        "scope": "variable.other.codepurify",
        "settings": {
          "foreground": "#4FC1FF"
        }
      },
      {
        "scope": "comment.block.codepurify",
        "settings": {
          "foreground": "#6A9955"
        }
      }
    ]
  }
}
```

## Grammar Scopes

- `keyword.control.codepurify` - Control flow keywords (`if`, `loop`, `/if`, `/loop`)
- `variable.other.codepurify` - Variable access expressions
- `comment.block.codepurify` - Template comments

## Development

### File Structure

```
codepurify-vscode/
├── package.json                    # Extension manifest
├── language-configuration.json     # Language configuration
├── syntaxes/
│   └── codepurify.tmLanguage.json  # TextMate grammar
└── README.md                       # This file
```

### Testing

1. Create test `.code` files in the `test/` directory
2. Open Extension Development Host (`F5`)
3. Verify syntax highlighting works correctly

## Contributing

1. Update the TextMate grammar in `syntaxes/codepurify.tmLanguage.json`
2. Test with various template files
3. Update documentation as needed

## License

MIT
