# Fjell Core

Core Item and Key Framework for Fjell - The foundational library that provides essential item management, key utilities, and service coordination for the entire Fjell ecosystem.

## Features

- **Type-safe item creation** with IFactory
- **Hierarchical key management** with KUtils
- **Abstract service layer** with AItemService
- **Query building and execution** with IQFactory and IQUtils
- **Comprehensive error handling** with custom error types
- **Testing utilities** for robust test suites
- **TypeScript-first design** for excellent developer experience

## Installation

```bash
npm install @fjell/core
```

## Quick Start

```typescript
import { IFactory, KUtils, AItemService } from '@fjell/core'

// Create items with the factory
const user = IFactory.create('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
})

// Generate hierarchical keys
const userKey = KUtils.generateKey(['users', user.id])

// Build services
class UserService extends AItemService {
  async createUser(userData: any) {
    const user = IFactory.create('user', userData)
    await this.validate(user)
    return this.save(user)
  }
}
```

## Core Modules

### IFactory
Factory for creating strongly-typed items with validation and defaults.

```typescript
interface User {
  id: string
  name: string
  email: string
}

const user = IFactory.create<User>('user', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
})
```

### KUtils
Utilities for hierarchical key generation and manipulation.

```typescript
// Generate keys
const userKey = KUtils.generateKey(['users', 'user-123'])
const profileKey = KUtils.generateKey(['users', 'user-123', 'profile'])

// Parse keys
const components = KUtils.parseKey(userKey) // ['users', 'user-123']

// Validate keys
const isValid = KUtils.isValidKey(userKey) // true
```

### AItemService
Abstract base class for building domain services with lifecycle management.

```typescript
class UserService extends AItemService {
  async create(userData: Partial<User>): Promise<User> {
    const user = IFactory.create<User>('user', userData)
    await this.validate(user)
    return this.save(user)
  }

  protected async validate(user: User): Promise<void> {
    if (!user.email.includes('@')) {
      throw new Error('Invalid email')
    }
  }
}
```

### Query System
Build and execute queries with IQFactory and IQUtils.

```typescript
const query = IQFactory.create('user')
  .where('status', 'active')
  .where('role', 'admin')
  .orderBy('createdAt', 'desc')
  .limit(10)

const results = await IQUtils.execute(query)
```

### Operations Interface

@fjell/core provides the standard Operations interface used across all fjell libraries. This interface defines the contract for working with Items:

```typescript
import { Operations, PrimaryOperations, ContainedOperations } from '@fjell/core';

// For primary items
const userOps: PrimaryOperations<User, 'user'> = ...;

// For contained items
const commentOps: ContainedOperations<Comment, 'comment', 'post'> = ...;
```

See [Operations README](src/operations/README.md) for detailed documentation.

### Validation Module

@fjell/core provides centralized validation functions for ensuring data integrity across the Fjell ecosystem:

```typescript
import { 
  validateLocations, 
  validateKey, 
  validatePK, 
  validateKeys,
  validateSchema,
  SchemaValidator
} from '@fjell/core/validation';
```

#### Schema Validation (Zod, Yup, etc.)

Universal schema validation that works with any validator matching the `SchemaValidator` interface. Zod is supported out of the box via duck typing:

```typescript
import { validateSchema } from '@fjell/core/validation';
import { z } from 'zod';

// Define a Zod schema
const userSchema = z.object({
  name: z.string().min(3),
  age: z.number().min(18),
  email: z.string().email().optional()
});

// Validate data before caching, sending to API, or persisting
const validatedUser = await validateSchema(userData, userSchema);

// Validation throws ValidationError with FieldError[] on failure
try {
  await validateSchema({ name: 'Al', age: 10 }, userSchema);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.fieldErrors);
    // [
    //   { path: ['name'], message: 'String must contain at least 3 character(s)', code: 'too_small' },
    //   { path: ['age'], message: 'Number must be greater than or equal to 18', code: 'too_small' }
    // ]
  }
}
```

**Schema Validation Features:**
- **Universal**: Works with Zod, Yup, Joi, or any validator matching the interface
- **Type-Safe**: Full TypeScript support with type inference
- **Error Transformation**: Automatically converts validator errors to Fjell `ValidationError`
- **Async Support**: Handles both sync and async validation
- **Available Everywhere**: Use in cache layers, APIs, persistence, or any system boundary

#### Location Validation

Validates that location key arrays match the expected coordinate hierarchy:

```typescript
import { validateLocations } from '@fjell/core/validation';

// Validate location array order
validateLocations(
  [{ kt: 'store', lk: 'store-1' }],
  coordinate,
  'create'  // operation name for error context
);

// Non-throwing validation
import { isValidLocations } from '@fjell/core/validation';
const result = isValidLocations(
  [{ kt: 'store', lk: 'store-1' }],
  coordinate,
  'create'
);
if (!result.valid) {
  console.log(result.error); // Validation error message
}
```

#### Key Validation

Validates PriKey and ComKey structures match library type:

```typescript
import { validateKey, validatePriKey, validateComKey } from '@fjell/core/validation';

// Validate any key type
validateKey(key, coordinate, 'get');

// Validate specific key types
validatePriKey(priKey, coordinate, 'update');
validateComKey(comKey, coordinate, 'remove');
```

#### Item Validation

Validates Item keys match expected types:

```typescript
import { validatePK, validateKeys } from '@fjell/core/validation';

// Validate item has correct primary key type
const validatedItem = validatePK(item, 'product');

// Validate item key types match key type array
const validatedItem = validateKeys(item, ['product', 'store']);
```

**Features:**
- **Comprehensive Error Messages**: Detailed context including operation name, expected vs actual values
- **Type Safety**: Full TypeScript support with proper type inference
- **Performance**: Optimized O(n) validation with minimal overhead
- **Flexible**: Both throwing and non-throwing variants available

See [Validation Examples](examples/validation-example.ts) for detailed usage patterns.

## Architecture Philosophy

Fjell Core is designed around **progressive enhancement**:

1. **Start Simple**: Basic operations require minimal setup
2. **Scale Gradually**: Add complexity only when needed
3. **Maintain Consistency**: Common patterns across all Fjell libraries
4. **Enable Integration**: Designed to work with the entire ecosystem

## Integration with Fjell Ecosystem

Fjell Core serves as the foundation for:

- **@fjell/registry**: Service location and dependency injection
- **@fjell/cache**: High-performance caching solutions
- **@fjell/lib**: Database abstraction layers
- **@fjell/providers**: React component state management
- **@fjell/client-api**: HTTP client utilities
- **@fjell/express-router**: Express.js routing utilities

## Type Safety

Built with TypeScript-first design for excellent developer experience:

```typescript
// Strongly typed factories
const user = IFactory.create<UserType>('user', userData)

// Type-safe key operations
const key = KUtils.generateKey(['users', user.id])
const [collection, id] = KUtils.parseKey(key)

// Compile-time validation
class UserService extends AItemService<User> {
  // Methods are typed to work with User objects
}
```

## Error Handling

Comprehensive error handling with descriptive messages:

```typescript
try {
  const user = await userService.create(invalidData)
} catch (error) {
  if (error instanceof CoreValidationError) {
    console.log('Validation failed:', error.details)
  } else if (error instanceof CoreNotFoundError) {
    console.log('User not found:', error.id)
  }
}
```

## Testing Support

Built-in testing utilities for robust test suites:

```typescript
import { TestUtils } from '@fjell/core/testing'

// Mock factories
const mockFactory = TestUtils.createMockFactory()
const testUser = mockFactory.create('user', { id: 'test-123' })

// Assertion helpers
expect(TestUtils.isValidKey(key)).toBe(true)
expect(TestUtils.getKeyComponents(key)).toEqual(['users', '123'])
```

## Performance

Optimized for production use:

- **Minimal Runtime Overhead**: Core operations are highly optimized
- **Memory Efficient**: Smart object pooling and reuse strategies
- **Lazy Loading**: Components load only when needed
- **Tree Shaking**: Only bundle what you use

## Examples

Check out the `/examples` directory for comprehensive usage examples:

- Basic item and key operations
- Service implementation patterns
- Query building and execution
- Integration with databases and APIs
- Testing strategies

## Documentation

- **Getting Started**: Step-by-step setup guide
- **API Reference**: Complete API documentation
- **Examples**: Real-world usage patterns
- **Migration Guide**: Upgrading from previous versions

## Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Code style and standards
- Testing requirements
- Documentation standards
- Pull request process

## License

Licensed under the Apache License 2.0. See LICENSE file for details.

## Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community support and questions
- **Documentation**: Comprehensive guides and API reference

Built with love by the Fjell team.
