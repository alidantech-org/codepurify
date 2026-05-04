---
title: Domain Definition
description: Define your domain entities and relationships with our schema
---

# Domain Definition

Learn how to define your domain entities and relationships using CodePurify's powerful schema system.

## What is a Domain?

A domain in CodePurify represents your business logic and data model. It defines:

- **Entities** - Your core data objects (User, Post, Product, etc.)
- **Fields** - Properties of each entity (id, name, email, etc.)
- **Relationships** - How entities connect to each other
- **Types** - Data types and validation rules

## Basic Domain Structure

```typescript
import { defineDomain } from 'codepurify';

export const myDomain = defineDomain({
  entities: {
    // Your entities go here
  },
  enums: {
    // Your enums go here
  },
  types: {
    // Custom types go here
  },
});
```

## Defining Entities

### Simple Entity

```typescript
User: {
  fields: {
    id: 'string',
    name: 'string',
    email: 'string',
    age: 'number',
  }
}
```

### Entity with Optional Fields

Use `?` to mark optional fields:

```typescript
User: {
  fields: {
    id: 'string',
    name: 'string',
    email: 'string',
    avatar: 'string?',  // Optional
    bio: 'string?',     // Optional
  }
}
```

### Entity with Relationships

```typescript
User: {
  fields: {
    id: 'string',
    name: 'string',
    email: 'string',
  },
  relationships: {
    posts: 'Post[]',      // One-to-many
    profile: 'Profile',   // One-to-one
    friends: 'User[]',     // Many-to-many
  }
}

Post: {
  fields: {
    id: 'string',
    title: 'string',
    content: 'string',
  },
  relationships: {
    author: 'User',        // Many-to-one
    comments: 'Comment[]', // One-to-many
  }
}
```

## Supported Field Types

### Primitive Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `date` - Date without time
- `datetime` - Date with time
- `json` - JSON objects

### Special Types

- `string?` - Optional string
- `number?` - Optional number
- `string[]` - Array of strings
- `number[]` - Array of numbers

## Defining Enums

```typescript
export const myDomain = defineDomain({
  entities: {
    User: {
      fields: {
        id: 'string',
        name: 'string',
        status: 'UserStatus',  // Reference enum
      }
    }
  },
  enums: {
    UserStatus: {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      SUSPENDED: 'Suspended',
    }
  }
});
```

## Custom Types

Define reusable custom types:

```typescript
export const myDomain = defineDomain({
  types: {
    Address: {
      street: 'string',
      city: 'string',
      country: 'string',
      zipCode: 'string',
    }
  },
  entities: {
    User: {
      fields: {
        id: 'string',
        name: 'string',
        address: 'Address',  // Use custom type
      }
    }
  }
});
```

## Advanced Features

### Validation Rules

```typescript
User: {
  fields: {
    id: 'string',
    email: {
      type: 'string',
      validation: {
        format: 'email',
        required: true,
      }
    },
    age: {
      type: 'number',
      validation: {
        min: 0,
        max: 150,
      }
    }
  }
}
```

### Default Values

```typescript
User: {
  fields: {
    id: 'string',
    name: 'string',
    status: {
      type: 'UserStatus',
      default: 'UserStatus.ACTIVE',
    },
    createdAt: {
      type: 'datetime',
      default: 'now',
    }
  }
}
```

### Indexes and Constraints

```typescript
User: {
  fields: {
    id: 'string',
    email: 'string',
  },
  constraints: {
    unique: ['email'],  // Unique constraint
    indexes: [
      { fields: ['name'] },  // Simple index
      { fields: ['email', 'name'], unique: true },  // Composite unique index
    ]
  }
}
```

## Complete Example

Here's a complete e-commerce domain:

```typescript
import { defineDomain } from 'codepurify';

export const ecommerceDomain = defineDomain({
  entities: {
    User: {
      fields: {
        id: 'string',
        name: 'string',
        email: 'string',
        status: 'UserStatus',
        createdAt: 'datetime',
      },
      relationships: {
        orders: 'Order[]',
        reviews: 'Review[]',
      },
      constraints: {
        unique: ['email'],
      }
    },
    Product: {
      fields: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        status: 'ProductStatus',
        createdAt: 'datetime',
      },
      relationships: {
        category: 'Category',
        reviews: 'Review[]',
        orderItems: 'OrderItem[]',
      }
    },
    Order: {
      fields: {
        id: 'string',
        userId: 'string',
        status: 'OrderStatus',
        total: 'number',
        createdAt: 'datetime',
      },
      relationships: {
        user: 'User',
        items: 'OrderItem[]',
      }
    }
  },
  enums: {
    UserStatus: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
    },
    ProductStatus: {
      AVAILABLE: 'available',
      OUT_OF_STOCK: 'out_of_stock',
      DISCONTINUED: 'discontinued',
    },
    OrderStatus: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    }
  }
});
```

## Best Practices

1. **Use Descriptive Names** - Make entity and field names clear and meaningful
2. **Consistent Naming** - Use consistent naming conventions (camelCase for fields, PascalCase for entities)
3. **Define Relationships** - Always define relationships between entities
4. **Use Enums** - Use enums for fixed sets of values
5. **Add Validation** - Include validation rules for data integrity
6. **Document Your Domain** - Use comments to explain complex relationships

## Next Steps

- [Templates](/docs/templates) - Learn how to create templates from your domain
- [Code Generation](/docs/code-generation) - Generate code from your domain
- [Configuration](/docs/configuration) - Configure generation options
