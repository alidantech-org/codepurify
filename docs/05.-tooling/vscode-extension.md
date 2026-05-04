---
title: VS Code Extension
description: Install and configure the Codepurify VS Code extension
---

# VS Code Extension

The Codepurify extension provides syntax highlighting, autocomplete, and error detection for template files.

## Features

- Syntax highlighting for `{! ... !}` templates
- Autocomplete for variables and keywords
- Real-time error detection
- Multi-language support (TypeScript, Markdown, etc.)
- Snippets for common patterns

## Installation

### From VSIX

1. Download the latest `.vsix` file from releases
2. Open VS Code Extensions panel (`Ctrl+Shift+X`)
3. Click "..." menu → "Install from VSIX..."
4. Select the downloaded `.vsix` file

<!-- screenshot: Extensions panel with Install from VSIX option -->

### From Open VSX

1. Open VS Code Extensions panel (`Ctrl+Shift+X`)
2. Search for "Codepurify"
3. Click "Install"

<!-- screenshot: Codepurify extension in marketplace -->

## Supported Editors

- **VS Code** - Full feature support
- **Windsurf** - Compatible extension support
- **Cursor** - Compatible extension support

## Quick Start

1. Install the extension
2. Open a template file (`.hbs` or `.cpt`)
3. Start typing `{!` to see autocomplete
4. Errors appear as red underlines

## File Extensions

The extension recognizes these file types:
- `.hbs` - Handlebars templates
- `.cpt` - Codepurify templates
- `.ts.cpt` - TypeScript templates
- `.md.cpt` - Markdown templates
