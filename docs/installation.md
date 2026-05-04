---
title: Installation
description: Get CodePurify installed and set up in your project
---

# Installation

Get CodePurify installed and set up in your project in minutes.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** version 18 or higher
- **npm** version 8 or higher (or yarn/pnpm)
- **TypeScript** (recommended for type safety)

## Install via npm

The easiest way to install CodePurify is via npm:

```bash
npm install codepurify
```

## Install via yarn

If you prefer yarn:

```bash
yarn add codepurify
```

## Install via pnpm

If you're using pnpm:

```bash
pnpm add codepurify
```

## Global Installation

You can also install CodePurify globally to use the CLI:

```bash
npm install -g codepurify
```

## Verify Installation

To verify that CodePurify is installed correctly, run:

```bash
npx codepurify --version
```

You should see the version number printed.

## Next Steps

Once you have CodePurify installed, you can:

1. [Quick Start](/docs/quickstart) - Learn the basics
2. [Domain Definition](/docs/domain-definition) - Define your domain
3. [Templates](/docs/templates) - Create templates
4. [CLI Reference](/docs/cli) - Command-line tools

## Troubleshooting

### Permission Denied

If you get a permission error, try using `sudo` (on macOS/Linux) or running your terminal as administrator (on Windows).

### Version Conflicts

If you have multiple versions of Node.js installed, make sure you're using the correct version:

```bash
node --version  # Should be 18 or higher
```

### Network Issues

If you're behind a corporate firewall, you may need to configure your npm registry:

```bash
npm config set registry https://registry.npmjs.org/
```

## Development Installation

If you want to contribute to CodePurify or use the latest development version:

```bash
git clone https://github.com/alidantech-org/codepurify.git
cd codepurify
npm install
npm run build
npm link
```

This will install the development version globally and link it for local development.
