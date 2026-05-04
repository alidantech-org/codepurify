---
title: Quick Start
description: Learn the basics and create your first CodePurify project
---

# Quick Start

Learn the basics of CodePurify and create your first project in just a few minutes.

## What You'll Build

In this quick start, you'll create a simple blog domain and generate a complete API with:

- User entities with relationships
- Database schema
- API endpoints
- TypeScript types

## Step 1: Create Your Project

Create a new directory for your project:

```bash
mkdir my-blog-project
cd my-blog-project
npm init -y
npm install codepurify
```

## Step 2: Define Your Domain

Create a file called `domain.ts`:

```typescript
import { defineDomain } from 'codepurify';

export const blogDomain = defineDomain({
  entities: {
    User: {
      fields: {
        id: 'string',
        email: 'string',
        name: 'string',
        avatar: 'string?',
        createdAt: 'datetime',
      },
      relationships: {
        posts: 'Post[]',
        comments: 'Comment[]',
      },
    },
    Post: {
      fields: {
        id: 'string',
        title: 'string',
        content: 'string',
        publishedAt: 'datetime?',
        createdAt: 'datetime',
        updatedAt: 'datetime',
      },
      relationships: {
        author: 'User',
        comments: 'Comment[]',
        tags: 'Tag[]',
      },
    },
    Comment: {
      fields: {
        id: 'string',
        content: 'string',
        createdAt: 'datetime',
      },
      relationships: {
        author: 'User',
        post: 'Post',
      },
    },
    Tag: {
      fields: {
        id: 'string',
        name: 'string',
        color: 'string',
      },
      relationships: {
        posts: 'Post[]',
      },
    },
  },
});
```

## Step 3: Generate Code

Create a simple script to generate your API:

```typescript
import { blogDomain } from './domain';
import { generateCode } from 'codepurify';

async function generateAPI() {
  const result = await generateCode(blogDomain, {
    templates: ['express-api', 'typescript-types', 'prisma-schema'],
    outputPath: './generated',
  });
  
  console.log('Generated files:', result.files);
}

generateAPI().catch(console.error);
```

Run the script:

```bash
npx ts-node generate.ts
```

## Step 4: Explore Generated Code

CodePurify will generate several files in the `./generated` directory:

### TypeScript Types
```typescript
// generated/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  posts?: Post[];
  comments?: Comment[];
}
```

### Express API
```typescript
// generated/api/users.ts
import express from 'express';
import { UserService } from '../services/user.service';

const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await UserService.findAll();
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await UserService.create(req.body);
  res.json(user);
});
```

### Database Schema
```prisma
// generated/schema.prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  avatar    String?
  createdAt DateTime  @default(now())
  posts     Post[]
  comments  Comment[]
}
```

## Step 5: Customize Templates

You can customize the generated code by creating your own templates:

```typescript
import { blogDomain } from './domain';
import { generateCode } from 'codepurify';

async function generateCustomAPI() {
  const result = await generateCode(blogDomain, {
    templates: ['./templates/my-api', './templates/my-types'],
    outputPath: './generated',
    config: {
      apiPrefix: '/api/v1',
      includeAuth: true,
    },
  });
  
  console.log('Generated files:', result.files);
}
```

## Next Steps

Congratulations! You've created your first CodePurify project. Here's what to explore next:

1. **Templates** - Learn how to create custom templates
2. **CLI Tools** - Use the command-line interface for automation
3. **Advanced Configuration** - Configure CodePurify for your specific needs
4. **API Reference** - Explore all available functions and options

## Common Questions

### Can I use CodePurify with existing projects?

Yes! CodePurify can generate code that works with existing databases and APIs. You can customize templates to match your current architecture.

### What databases are supported?

CodePurify supports any database through templates. We provide built-in templates for PostgreSQL, MySQL, MongoDB, and SQLite.

### Can I generate frontend code?

Absolutely! You can create templates for React components, Vue.js, Angular, or any frontend framework.

## Need Help?

- [Installation Guide](/docs/installation) - Installation issues
- [Domain Definition](/docs/domain-definition) - Learn about defining domains
- [Templates](/docs/templates) - Create custom templates
- [GitHub Issues](https://github.com/alidantech-org/codepurify/issues) - Report bugs or request features
