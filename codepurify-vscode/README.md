# Codepurify VS Code Extension

Syntax highlighting for Codepurify templates using the `(~ ... ~)` syntax.

## Features

- **Syntax Highlighting**: Highlights Codepurify template syntax
- **File Association**: `.cpt` files are treated as TypeScript
- **Comment Support**: `(~# comment #~)` syntax highlighting
- **Control Flow**: `(~ if ~)`, `(~ each ~)`, `(~ /if ~)`, `(~ /each ~)` highlighting
- **Variable Access**: `(~ entity.names.casing.pascal ~)` highlighting

## Installation

### Development Mode

1. Open this folder in VS Code:
   ```bash
   code codepurify-vscode
   ```

2. Press `F5` to launch the Extension Development Host

3. Open a `.cpt` file to test syntax highlighting

### Manual Installation

1. Package the extension:
   ```bash
   cd codepurify-vscode
   vsce package
   ```

2. Install the `.vsix` file in VS Code

## Syntax Examples

### Variables
```typescript
(~ entity.names.casing.pascal ~)
(~ field.names.casing.camel ~)
(~ relation.target_entity.names.kebab ~)
```

### Control Flow
```typescript
(~ if field.flags.is_string ~)
  @IsString()
  (~ /if ~)

(~ each entity.fields.arrays.parts.items as field ~)
  (~ field.names.casing.camel ~): string;
(~ /each ~)
```

### Comments
```typescript
(~# This is a comment #~)
(~# Multi-line comment
   spanning multiple lines #~)
```

## File Association

`.cpt` files are automatically associated with TypeScript, providing:

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

- `keyword.control.codepurify` - Control flow keywords (`if`, `each`, `/if`, `/each`)
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

1. Create test `.cpt` files in the `test/` directory
2. Open Extension Development Host (`F5`)
3. Verify syntax highlighting works correctly

## Contributing

1. Update the TextMate grammar in `syntaxes/codepurify.tmLanguage.json`
2. Test with various template files
3. Update documentation as needed

## License

MIT
